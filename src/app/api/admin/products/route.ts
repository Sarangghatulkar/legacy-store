import { NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/serverAuth';

// GET: Fetch all products (including archived) for admin view
export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ products: [] });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add new product (Admin Only)
export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { title, slug, price, compare_price, description, category_name, images, stock, sizes, fit, material, is_featured, is_trending } = body;

    if (!title || price === undefined || price < 0) {
      return NextResponse.json({ error: 'Valid title and price are required' }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        message: 'Product accepted (Dev Demo Mode)',
        product: { ...body, id: 'prod-' + Date.now(), slug: generatedSlug },
      });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          title,
          slug: generatedSlug,
          description: description || '',
          price: Number(price),
          compare_price: compare_price ? Number(compare_price) : null,
          category_name,
          images: images || [],
          sizes: sizes || [],
          fit: fit || null,
          material: material || null,
          stock: Number(stock) || 0,
          is_featured: Boolean(is_featured),
          is_trending: Boolean(is_trending),
          is_archived: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Archive product (Admin Only)
export async function DELETE(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ message: 'Product archived (Dev Demo Mode)' });
    }

    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from('products')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product archived' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
