export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  category_id?: string;
  category_name?: string;
  images: string[];
  sizes?: string[]; // e.g. ['S', 'M', 'L', 'XL', 'XXL'] or ['30', '32', '34', '36']
  colors?: { name: string; hex: string }[];
  material?: string;
  fit?: string; // Slim Fit, Relaxed, Tailored
  stock: number;
  is_featured: boolean;
  is_trending?: boolean;
  is_new?: boolean;
  is_archived: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
  badge?: string; // 'NEW' | 'BESTSELLER' | 'LUXE DEAL' | 'DUO' | 'MOST GIFTED'
  fragrance_notes?: string; // e.g. 'CITRUS · AROMATIC · WOODY' or 'AUTOMATIC · SAPPHIRE · 40MM'
  specs?: string;
  tags?: string[]; // e.g. ['AUTOMATIC', '40MM', 'SAPPHIRE']
  tagline?: string;
  occasion?: string;
  volume?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_title: string;
  product_image?: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  total_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  monthlyRevenue: { month: string; revenue: number }[];
  salesByCategory: { name: string; value: number }[];
}
