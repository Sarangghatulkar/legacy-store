import { Product, Order, AnalyticsSummary } from '@/types';
import { INITIAL_PRODUCTS } from './initialData';
import { supabase, getServiceSupabase } from './supabase';

const STORAGE_PRODUCTS_KEY = 'legacy_store_products';
const STORAGE_ORDERS_KEY = 'legacy_store_orders';

// In-memory fallback if localStorage is unavailable
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryOrders: Order[] = [
  {
    id: 'ORD-8092',
    customer_name: 'Vikramaditya Rathore',
    customer_email: 'vikram.rathore@example.com',
    customer_phone: '+91 98201 12345',
    shipping_address: {
      fullName: 'Vikramaditya Rathore',
      addressLine1: 'Penthouse 14A, Oberoi Sky Heights, Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India',
    },
    total_amount: 4999,
    currency: 'INR',
    status: 'processing',
    payment_status: 'paid',
    razorpay_payment_id: 'pay_LX9812A09',
    created_at: '2026-11-17T14:30:00.000Z',
    items: [
      {
        id: 'item-1',
        order_id: 'ORD-8092',
        product_title: 'LEGACY TOURBILLON (41MM)',
        price: 4999,
        quantity: 1,
        total: 4999,
      }
    ]
  },
  {
    id: 'ORD-8091',
    customer_name: 'Aditya Singhania',
    customer_email: 'aditya.singhania@example.com',
    customer_phone: '+91 98110 54321',
    shipping_address: {
      fullName: 'Aditya Singhania',
      addressLine1: 'Villa 22, DLF Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'India',
    },
    total_amount: 8999,
    currency: 'INR',
    status: 'shipped',
    payment_status: 'paid',
    razorpay_payment_id: 'pay_LX9741B22',
    created_at: '2026-11-16T11:15:00.000Z',
    items: [
      {
        id: 'item-2',
        order_id: 'ORD-8091',
        product_title: 'THE LEGACY TRILOGY SET',
        price: 8999,
        quantity: 1,
        total: 8999,
      }
    ]
  },
  {
    id: 'ORD-8090',
    customer_name: 'Rohan Mehra',
    customer_email: 'rohan.mehra@example.com',
    customer_phone: '+91 99000 88776',
    shipping_address: {
      fullName: 'Rohan Mehra',
      addressLine1: '402, Embassy Habitat, Palace Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560052',
      country: 'India',
    },
    total_amount: 3499,
    currency: 'INR',
    status: 'delivered',
    payment_status: 'paid',
    razorpay_payment_id: 'pay_LX9620C33',
    created_at: '2026-11-14T09:45:00.000Z',
    items: [
      {
        id: 'item-3',
        order_id: 'ORD-8090',
        product_title: 'LEGACY ASTRUM (40MM)',
        price: 3499,
        quantity: 1,
        total: 3499,
      }
    ]
  }
];

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Product[];
      } catch {
        // Fallback to local storage or memory
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(memoryProducts));
    }
    return memoryProducts;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug) || null;
  },

  async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      try {
        const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
        if (!error && data) return data as Product;
      } catch {
        // Fallback
      }
    }

    if (typeof window !== 'undefined') {
      const products = await this.getProducts();
      const updated = [newProduct, ...products];
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
      memoryProducts = updated;
    } else {
      memoryProducts.unshift(newProduct);
    }

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    // If Supabase is active, update Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Product;
      } catch {
        // Fallback
      }
    }

    if (typeof window !== 'undefined') {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
        memoryProducts = products;
        return products[index];
      }
    }
    return null;
  },

  async updateStock(id: string, newStock: number): Promise<boolean> {
    return !!(await this.updateProduct(id, { stock: Math.max(0, newStock) }));
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) return true;
      } catch {
        // Fallback
      }
    }

    if (typeof window !== 'undefined') {
      const products = await this.getProducts();
      const updated = products.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
      memoryProducts = updated;
      return true;
    }
    return false;
  },

  // -------------------------------------------------------------------------
  // SERVER-ONLY admin methods — use service role to bypass RLS.
  // -------------------------------------------------------------------------
  async getProductsAdmin(): Promise<Product[]> {
    const sb = getServiceSupabase();
    const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) return data as Product[];
    return memoryProducts;
  },

  async addProductAdmin(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const sb = getServiceSupabase();
    const { data, error } = await sb.from('products').insert([product]).select().single();
    if (!error && data) return data as Product;
    const newProduct = { ...product, id: 'prod-' + Date.now(), created_at: new Date().toISOString() };
    memoryProducts.unshift(newProduct);
    return newProduct;
  },

  async deleteProductAdmin(id: string): Promise<boolean> {
    const sb = getServiceSupabase();
    const { error } = await sb.from('products').update({ is_archived: true }).eq('id', id);
    return !error;
  },
};

export const orderService = {
  async getOrders(): Promise<Order[]> {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((o: any) => ({
            ...o,
            items: o.order_items || [],
          })) as Order[];
        }
      } catch {
        // Fallback
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(memoryOrders));
    }
    return memoryOrders;
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const orders = await this.getOrders();
      const updated = [newOrder, ...orders];
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
      memoryOrders = updated;
    } else {
      memoryOrders.unshift(newOrder);
    }

    return newOrder;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (!error) return true;
      } catch {
        // Fallback
      }
    }

    if (typeof window !== 'undefined') {
      const orders = await this.getOrders();
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index].status = status;
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
        memoryOrders = orders;
        return true;
      }
    }
    return false;
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    const orders = await this.getOrders();
    const products = await productService.getProducts();

    const totalRevenue = orders.reduce((sum, o) => (o.payment_status === 'paid' ? sum + Number(o.total_amount) : sum), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = new Set(orders.map(o => o.customer_email)).size;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers: totalCustomers || 1,
      recentOrders: orders.slice(0, 6),
      monthlyRevenue: [
        { month: 'Jun', revenue: 42000 },
        { month: 'Jul', revenue: 68000 },
        { month: 'Aug', revenue: 95000 },
        { month: 'Sep', revenue: 134000 },
        { month: 'Oct', revenue: 182000 },
        { month: 'Nov', revenue: totalRevenue || 248000 },
      ],
      salesByCategory: [
        { name: 'Automatic Watches', value: 42 },
        { name: 'Steel Bracelets', value: 28 },
        { name: 'Collector Sets', value: 18 },
        { name: 'Leather & Gold', value: 12 },
      ]
    };
  }
};
