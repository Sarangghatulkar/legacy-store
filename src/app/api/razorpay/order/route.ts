import { NextResponse } from 'next/server';
import { getRazorpayInstance } from '@/lib/razorpay';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/initialData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerInfo } = body;

    // 1. Validate payload structure
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order: Cart items are required' },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.fullName) {
      return NextResponse.json(
        { error: 'Invalid order: Customer details are required' },
        { status: 400 }
      );
    }

    // 2. SERVER-SIDE PRICE & INVENTORY VALIDATION
    // Never trust client-sent prices or totals. Retrieve genuine prices from trusted catalog/database.
    let calculatedTotal = 0;
    const validatedItems: Array<{
      productId: string;
      title: string;
      image: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
      total: number;
    }> = [];

    if (isSupabaseConfigured()) {
      const supabase = getServiceSupabase();
      const productIds = items.map((i: any) => i.productId);

      const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (dbError || !dbProducts || dbProducts.length === 0) {
        return NextResponse.json(
          { error: 'Failed to verify product prices against catalog' },
          { status: 400 }
        );
      }

      for (const item of items) {
        const product = dbProducts.find((p) => p.id === item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ID ${item.productId}` },
            { status: 400 }
          );
        }

        if (product.is_archived) {
          return NextResponse.json(
            { error: `Product "${product.title}" is no longer available` },
            { status: 400 }
          );
        }

        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));

        if (product.stock < qty) {
          return NextResponse.json(
            {
              error: `Insufficient stock for "${product.title}". Only ${product.stock} units available.`,
            },
            { status: 400 }
          );
        }

        const itemTotal = Number(product.price) * qty;
        calculatedTotal += itemTotal;

        validatedItems.push({
          productId: product.id,
          title: product.title,
          image: product.images?.[0] || '',
          price: Number(product.price),
          quantity: qty,
          size: item.selectedSize,
          color: item.selectedColor,
          total: itemTotal,
        });
      }
    } else {
      // Development fallback without Supabase: validate against INITIAL_PRODUCTS catalog
      for (const item of items) {
        const product = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
        const price = product ? product.price : 2499;
        const title = product ? product.title : 'Menswear Garment';
        const image = product?.images?.[0] || '';
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));

        const itemTotal = price * qty;
        calculatedTotal += itemTotal;

        validatedItems.push({
          productId: item.productId,
          title,
          image,
          price,
          quantity: qty,
          size: item.selectedSize,
          color: item.selectedColor,
          total: itemTotal,
        });
      }
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json(
        { error: 'Calculated order total must be greater than zero' },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(calculatedTotal * 100);

    // 3. PERSIST ORDER AS 'unpaid' BEFORE RAZORPAY INITIATION
    let internalOrderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isSupabaseConfigured()) {
      const supabase = getServiceSupabase();

      const { data: orderRecord, error: orderInsertError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: customerInfo.userId || null,
            customer_name: customerInfo.fullName,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
            shipping_address: customerInfo,
            total_amount: calculatedTotal,
            currency: 'INR',
            status: 'pending',
            payment_status: 'unpaid',
          },
        ])
        .select()
        .single();

      if (orderInsertError || !orderRecord) {
        console.error('Order creation in DB failed:', orderInsertError);
        return NextResponse.json(
          { error: 'Failed to record pending order in database' },
          { status: 500 }
        );
      }

      internalOrderId = orderRecord.id;

      // Insert line items
      const orderItemsToInsert = validatedItems.map((vi) => ({
        order_id: internalOrderId,
        product_id: vi.productId.includes('-') && vi.productId.length > 30 ? vi.productId : null,
        product_title: vi.title,
        product_image: vi.image,
        size: vi.size || null,
        color: vi.color || null,
        price: vi.price,
        quantity: vi.quantity,
        total: vi.total,
      }));

      await supabase.from('order_items').insert(orderItemsToInsert);
    }

    // 4. CREATE RAZORPAY ORDER
    const razorpay = getRazorpayInstance();

    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${internalOrderId.substring(0, 30)}`,
        notes: {
          internalOrderId,
          customerEmail: customerInfo.email,
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);

      // Link Razorpay Order ID to database order
      if (isSupabaseConfigured()) {
        const supabase = getServiceSupabase();
        await supabase
          .from('orders')
          .update({ razorpay_order_id: razorpayOrder.id })
          .eq('id', internalOrderId);
      }

      return NextResponse.json({
        id: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        internalOrderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      });
    }

    // 5. DEV SIMULATION MODE (When Razorpay API keys are not bound)
    const mockRazorpayId = `order_mock_${Date.now()}`;

    if (isSupabaseConfigured()) {
      const supabase = getServiceSupabase();
      await supabase
        .from('orders')
        .update({ razorpay_order_id: mockRazorpayId })
        .eq('id', internalOrderId);
    }

    return NextResponse.json({
      id: mockRazorpayId,
      razorpayOrderId: mockRazorpayId,
      internalOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockKey',
      isMock: true,
    });
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
