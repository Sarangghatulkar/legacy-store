import { NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/serverAuth';

// GET: Fetch all registered customer profiles with their order history (Admin Only)
export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Demo fallback customers if Supabase is offline or empty
  const fallbackCustomers = [
    {
      id: 'cust-1',
      full_name: 'Vikramaditya Rathore',
      email: 'vikram.rathore@example.com',
      phone: '+91 98201 12345',
      role: 'customer',
      created_at: '2026-10-12T10:00:00.000Z',
      orders_count: 2,
      total_spent: 13998,
      last_order_date: '2026-11-17T14:30:00.000Z',
      city: 'Mumbai',
    },
    {
      id: 'cust-2',
      full_name: 'Aditya Singhania',
      email: 'aditya.singhania@example.com',
      phone: '+91 98110 54321',
      role: 'customer',
      created_at: '2026-10-20T14:20:00.000Z',
      orders_count: 1,
      total_spent: 8999,
      last_order_date: '2026-11-16T11:15:00.000Z',
      city: 'Gurugram',
    },
    {
      id: 'cust-3',
      full_name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      phone: '+91 99000 88776',
      role: 'customer',
      created_at: '2026-11-01T08:15:00.000Z',
      orders_count: 1,
      total_spent: 3499,
      last_order_date: '2026-11-14T09:45:00.000Z',
      city: 'Bengaluru',
    },
    {
      id: 'cust-4',
      full_name: 'Sarang Ghatulkar',
      email: 'sarangghatulkar.work@gmail.com',
      phone: '+91 98765 43210',
      role: 'admin',
      created_at: '2026-09-01T00:00:00.000Z',
      orders_count: 0,
      total_spent: 0,
      last_order_date: null,
      city: 'Pune',
    },
  ];

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ customers: fallbackCustomers });
  }

  try {
    const supabase = getServiceSupabase();

    // 1. Fetch profiles
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profErr) {
      return NextResponse.json({ customers: fallbackCustomers, notice: profErr.message });
    }

    // 2. Fetch orders to aggregate customer spending
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_email, user_id, total_amount, payment_status, created_at, shipping_address');

    const customerStats = new Map<
      string,
      { count: number; total: number; lastDate: string | null; city: string | null }
    >();

    if (orders) {
      orders.forEach((o: any) => {
        const key = (o.customer_email || '').toLowerCase();
        if (!key) return;
        const current = customerStats.get(key) || { count: 0, total: 0, lastDate: null, city: null };
        current.count += 1;
        if (o.payment_status === 'paid') {
          current.total += Number(o.total_amount || 0);
        }
        if (!current.lastDate || new Date(o.created_at) > new Date(current.lastDate)) {
          current.lastDate = o.created_at;
        }
        if (o.shipping_address?.city && !current.city) {
          current.city = o.shipping_address.city;
        }
        customerStats.set(key, current);
      });
    }

    const merged = (profiles && profiles.length > 0 ? profiles : fallbackCustomers).map((p: any) => {
      const stats = customerStats.get((p.email || '').toLowerCase()) || {
        count: 0,
        total: 0,
        lastDate: null,
        city: null,
      };
      return {
        id: p.id,
        full_name: p.full_name || 'Client',
        email: p.email,
        phone: p.phone || '—',
        role: p.role || 'customer',
        created_at: p.created_at,
        orders_count: p.orders_count !== undefined ? p.orders_count : stats.count,
        total_spent: p.total_spent !== undefined ? p.total_spent : stats.total,
        last_order_date: p.last_order_date || stats.lastDate,
        city: p.city || stats.city || '—',
      };
    });

    return NextResponse.json({ customers: merged });
  } catch (err: any) {
    return NextResponse.json({ customers: fallbackCustomers, notice: err.message });
  }
}
