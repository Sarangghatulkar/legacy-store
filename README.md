# ApexStore — Enterprise E-Commerce Platform

A production-ready e-commerce platform built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase PostgreSQL, and Razorpay payment gateway integration.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Modern Homepage:** Hero showcase, feature highlights, and curated product collections.
- **Dynamic Catalog (`/products`):** Category pills, real-time search, low-to-high/high-to-low and rating filters.
- **Product Details (`/products/[slug]`):** Multi-image gallery, real-time stock counters, discount badges, and instant checkout.
- **Cart System:** Slide-over cart drawer with persistent items powered by Zustand.
- **Razorpay Checkout (`/checkout`):** Seamless UPI, Credit/Debit card, and Netbanking payment flow with automated signature verification.
- **Order Success (`/order-success`):** Instant receipt, reference code, and tracking details.

### 📊 Merchant Administrator Dashboard (`/admin`)
- **Executive Overview (`/admin`):** Live GMV (Gross Merchandising Value), total order counts, inventory stats, and recent customer transactions.
- **Sales Analytics (`/admin/analytics`):** Interactive Recharts area chart for 6-month revenue trends and category-wise share breakdown.
- **Product Catalog Management (`/admin/products`):** Modal form to add real products with images, price, stock, and homepage feature toggles.
- **Order Fulfillment (`/admin/orders`):** Update shipment state across `pending` → `processing` → `shipped` → `delivered`.
- **Database & API Settings (`/admin/settings`):** Easy reference and instructions to configure Supabase and Razorpay credentials.

---

## 🚀 Getting Started

### 1. Install & Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your customer storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to manage products and inspect sales.

### 2. Configure Real-World Selling (.env.local)

Edit `.env.local` to connect your production accounts:

```env
# Supabase PostgreSQL Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Merchant Gateway (UPI, Cards, Netbanking)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
```

### 3. Initialize Supabase Database
Run the complete SQL schema found in [supabase_schema.sql](file:///d:/e%20commers/supabase_schema.sql) in your Supabase SQL Editor.
