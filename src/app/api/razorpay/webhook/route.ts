import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Read raw body as text for cryptographic HMAC verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // 1. WEBHOOK SIGNATURE VERIFICATION
    if (webhookSecret && webhookSecret !== 'your_razorpay_webhook_secret_here') {
      if (!signature) {
        console.warn('Razorpay webhook received without x-razorpay-signature header');
        return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Invalid Razorpay webhook signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ received: true, mode: 'dev_mock' });
    }

    const supabase = getServiceSupabase();

    // 2. IDEMPOTENT EVENT HANDLING
    if (event === 'payment.captured' || event === 'order.paid') {
      if (razorpayOrderId) {
        const { data: orders } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('razorpay_order_id', razorpayOrderId);

        if (orders && orders.length > 0) {
          const order = orders[0];

          // Check if already processed to prevent duplicate inventory deduction
          if (order.payment_status !== 'paid') {
            // Deduct stock atomically
            if (order.order_items && order.order_items.length > 0) {
              for (const item of order.order_items) {
                if (item.product_id) {
                  await supabase.rpc('decrement_stock', {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity,
                  });
                }
              }
            }

            // Update order status
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                status: 'processing',
                razorpay_payment_id: razorpayPaymentId,
              })
              .eq('id', order.id);

            console.log(`Webhook successfully fulfilled order ${order.id}`);
          }
        }
      }
    } else if (event === 'payment.failed') {
      if (razorpayOrderId) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('razorpay_order_id', razorpayOrderId)
          .neq('payment_status', 'paid'); // Never overwrite if already paid

        console.log(`Webhook marked order for ${razorpayOrderId} as failed`);
      }
    }

    // Always respond 200 OK so Razorpay acknowledges delivery
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Razorpay webhook handler error:', err);
    // Return 200 so webhook does not loop continuously on unexpected errors
    return NextResponse.json({ received: true, error: err.message }, { status: 200 });
  }
}
