import { NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/serverAuth';
import { INITIAL_PRODUCTS, CATEGORIES } from '@/lib/initialData';

// POST: Seed Supabase database with initial luxury timepieces and categories (Admin Only)
export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 }
    );
  }

  try {
    const supabase = getServiceSupabase();

    // 1. Seed Categories first
    let categoriesInserted = 0;
    for (const cat of CATEGORIES) {
      const { error: catErr } = await supabase
        .from('categories')
        .upsert(
          {
            name: cat.name,
            slug: cat.slug,
            description: cat.description || `Luxury ${cat.name} Collection`,
          },
          { onConflict: 'slug' }
        );
      if (!catErr) categoriesInserted++;
    }

    // 2. Fetch created categories to resolve category_id
    const { data: dbCategories } = await supabase.from('categories').select('id, name, slug');
    const categoryMap = new Map<string, string>();
    if (dbCategories) {
      dbCategories.forEach((c) => {
        categoryMap.set(c.name.toLowerCase(), c.id);
        categoryMap.set(c.slug.toLowerCase(), c.id);
      });
    }

    // 3. Seed Products
    let productsInserted = 0;
    const errors: string[] = [];

    for (const p of INITIAL_PRODUCTS) {
      const categoryId = categoryMap.get((p.category_name || '').toLowerCase()) || null;

      const productPayload = {
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compare_price: p.compare_price || null,
        category_id: categoryId,
        category_name: p.category_name,
        images: p.images,
        stock: p.stock || 25,
        material: p.specs || '316L Surgical Stainless Steel',
        fit: p.tagline || 'Haute Horlogerie',
        is_featured: p.is_featured ?? true,
        is_trending: p.is_trending ?? true,
        is_archived: false,
        rating: p.rating || 4.9,
        reviews_count: p.reviews_count || 120,
      };

      const { error: prodErr } = await supabase
        .from('products')
        .upsert(productPayload, { onConflict: 'slug' });

      if (prodErr) {
        errors.push(`${p.title}: ${prodErr.message}`);
      } else {
        productsInserted++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully: ${productsInserted} timepieces and ${categoriesInserted} categories updated.`,
      productsInserted,
      categoriesInserted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
