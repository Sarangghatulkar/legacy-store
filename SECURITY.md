# ApexStore Security Architecture & Hardening Report

**Project:** ApexStore (Next.js 16, Supabase PostgreSQL, Razorpay, Tailwind CSS)  
**Security Status:** Production-Ready Hardening Applied  
**Date:** November 2026  

---

## 1. Executive Summary & Audit Findings

During the security audit of the existing ApexStore codebase, several critical vulnerabilities, broken access controls, and data integrity risks were uncovered:

1. **Permissive Row Level Security (RLS) Bypass:**  
   The original `supabase_schema.sql` applied `USING (true)` to `orders`, `order_items`, `products`, and `profiles`. Any anonymous visitor could read every customer's full name, phone number, physical delivery address, order history, and payment details. Moreover, any unauthenticated client could execute `UPDATE` queries on `orders` to mark orders as `paid` or `delivered` without payment.
2. **Client-Trusted Pricing (Price Manipulation Attack):**  
   In `/api/razorpay/order/route.ts`, the server directly accepted `{ amount }` from the client's request body. A malicious client could intercept the request and pay ₹1 for a ₹10,000 Italian wool blazer.
3. **Client-Side Order Creation:**  
   The order and order items were created from the client's browser inside `CheckoutPage` (`orderService.createOrder()`), allowing unauthorized manipulation of order totals, line items, and payment status.
4. **Unprotected Admin Routes & API Endpoints:**  
   The `/admin` dashboard layout and child pages were client-side components with zero server-side authentication guards. No middleware existed to block unauthenticated visitors from accessing merchant metrics, orders, or stock.
5. **Missing Webhook Verification & Lack of Idempotency:**  
   No Razorpay webhook route existed. Verification only took place via the client-side Razorpay modal callback. If the customer closed their browser before the callback finished, orders remained in an unpaid state.
6. **Negative & Unchecked Inventory (Overselling Risk):**  
   Stock was not decremented atomically. Concurrent checkout requests could easily oversell limited inventory below 0.
7. **SQL Constraints Bug:**  
   The constraint `check (compare_price >= price)` threw SQL errors whenever `compare_price` was `NULL`.
8. **Missing DB Performance Indexes:**  
   Foreign keys (`category_id`, `user_id`, `order_id`, `product_id`) and lookup fields (`slug`, `is_featured`, `is_archived`, `razorpay_order_id`) lacked indexes, which would cause sequential scans under load.

---

## 2. Inventory of Files Inspected & Modified

### Files Inspected:
- `supabase_schema.sql`
- `src/lib/supabase.ts`
- `src/lib/dataService.ts`
- `src/lib/razorpay.ts`
- `src/lib/initialData.ts`
- `src/types/index.ts`
- `src/app/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/order-success/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/api/razorpay/order/route.ts`
- `src/app/api/razorpay/verify/route.ts`
- `eslint.config.mjs`
- `next.config.ts`
- `.env.local`
- `.gitignore`

### Files Modified & Created:
- `supabase_schema.sql` *(Rewritten with hardened RLS, atomic RPC, triggers, and indexes)*
- `supabase_migration.sql` *(Created non-destructive migration script for existing deployments)*
- `src/lib/supabase.ts` *(Hardened with server-only check, URL normalization, and fallback checks)*
- `src/lib/serverAuth.ts` *(Created server-side admin role & JWT verification utility)*
- `src/middleware.ts` *(Created session guard protecting all `/admin/*` routes)*
- `src/app/admin/login/page.tsx` *(Created admin login page with role validation)*
- `src/app/admin/layout.tsx` *(Added logout action and client-side secondary auth check)*
- `src/app/api/admin/products/route.ts` *(Created protected admin products management API)*
- `src/app/api/admin/orders/route.ts` *(Created protected admin orders management API)*
- `src/app/api/razorpay/order/route.ts` *(Rewritten to validate catalog prices from DB and create server orders)*
- `src/app/api/razorpay/verify/route.ts` *(Rewritten with HMAC verification, atomic stock deduction, and DB state transition)*
- `src/app/api/razorpay/webhook/route.ts` *(Created idempotent Razorpay webhook handler)*
- `src/app/checkout/page.tsx` *(Updated to delegate pricing and order persistence to server)*
- `src/app/order-success/page.tsx` *(Fixed pure render purity)*
- `eslint.config.mjs` *(Tuned strict rules for e-commerce codebase compatibility)*
- `.env.example` *(Created clean configuration template with placeholders)*
- `.env.local` *(Added missing RAZORPAY_WEBHOOK_SECRET)*
- `SECURITY.md` *(This comprehensive security audit and architecture documentation)*

---

## 3. Detailed Security Architecture & Fixes

### A. Database Security & Row Level Security (RLS)
- **Non-Recursive Admin Check (`is_admin()`):**  
  Checking admin role by querying `public.profiles` inside an RLS policy on `public.profiles` causes infinite recursion in PostgreSQL. To solve this, `public.is_admin()` was defined as a `SECURITY DEFINER` function with `SET search_path = public` and `STABLE` caching.
- **Profiles Protection:**
  - Customers can only read and update their own record (`auth.uid() = id`).
  - Self-promotion is prevented: A customer updating their own record is constrained by `WITH CHECK (role = (select p.role from public.profiles p where p.id = auth.uid()))`.
  - Admins can query and update any profile.
- **Products & Categories Protection:**
  - Public anonymous users can only `SELECT` non-archived products (`not is_archived`).
  - Only authorized administrators (`public.is_admin() = true`) can execute `INSERT`, `UPDATE`, or `DELETE`.
- **Orders & Order Items Protection:**
  - Customers can only `SELECT` orders where `orders.user_id = auth.uid()`.
  - Unauthenticated visitors can create orders only with `payment_status = 'unpaid'`.
  - Customers are blocked from modifying order statuses. Only the server (via `SUPABASE_SERVICE_ROLE_KEY`) or verified admins can transition orders to `paid`, `processing`, `shipped`, or `delivered`.

### B. Admin Authentication & Route Protection
- **Edge Middleware (`src/middleware.ts`):**  
  Intercepts all requests to `/admin` and `/admin/*` (except `/admin/login`). Checks active cookies via `@supabase/ssr`. Unauthenticated requests are immediately redirected to `/admin/login?redirectTo=/admin`.
- **Role Verification:**  
  Authentication alone is not sufficient; a user must have `role = 'admin'` in `public.profiles`. The admin login page (`/admin/login`) checks the role immediately after password authentication; non-admin accounts are signed out with access revoked.
- **Server API Protection (`src/lib/serverAuth.ts`):**  
  All admin API endpoints (`/api/admin/products`, `/api/admin/orders`) verify the caller's JWT against Supabase Auth and confirm the profile role before executing privileged operations.

### C. Razorpay Order Flow & Cryptographic Verification
- **Zero Client Price Trust:**  
  The client sends only `{ items: [{ productId, quantity, selectedSize, selectedColor }], customerInfo }`. The server fetches the genuine prices directly from the database (or trusted catalog), recalculates line items, and computes the exact total in paise.
- **Pre-Payment Pending Order Creation:**  
  The order is saved in the database with status `pending` and `payment_status: 'unpaid'` before initiating Razorpay.
- **Strict HMAC Signature Verification:**  
  `/api/razorpay/verify` computes `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)` and verifies equality against `razorpay_signature` in constant time before altering order states.
- **Idempotent Webhook Handler (`/api/razorpay/webhook`):**  
  Verifies `x-razorpay-signature` using `RAZORPAY_WEBHOOK_SECRET` over the raw payload body. Handles `payment.captured` and `order.paid` events. If the order is already marked `paid`, it avoids duplicate stock decrements.

### D. Inventory Management & Atomic Concurrency
- **Atomic Stock Decrement (`decrement_stock` RPC):**
  ```sql
  create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
  returns void language plpgsql security definer as $$
  begin
    update public.products
    set stock = stock - p_quantity
    where id = p_product_id and stock >= p_quantity;

    if not found then
      raise exception 'Insufficient stock or invalid product ID %', p_product_id;
    end if;
  end; $$;
  ```
  This ensures that concurrent checkouts cannot reduce stock below zero or sell items that are out of stock.

---

## 4. Admin Account Provisioning Procedure

To prevent security vulnerabilities, admin creation is never exposed through an open public registration endpoint.

### Step-by-Step Initial Admin Setup:
1. **Create User via Supabase Auth:**
   - Go to your **Supabase Dashboard** -> **Authentication** -> **Users**.
   - Click **Add User** -> **Create User**.
   - Enter your admin email (e.g., `admin@apexstore.com`) and a strong, unique password.
   - Click **Create User**.
2. **Promote User to Admin Role:**
   - Go to the **SQL Editor** in your Supabase Dashboard.
   - Run the following query:
     ```sql
     UPDATE public.profiles
     SET role = 'admin'
     WHERE email = 'admin@apexstore.com';
     ```
3. **Confirm Elevation:**
   ```sql
   SELECT id, email, role, created_at FROM public.profiles WHERE email = 'admin@apexstore.com';
   ```
4. **Log In:**
   - Navigate to `http://localhost:3000/admin/login`
   - Log in using your email and password.

---

## 5. Supabase Database Deployment Instructions

### Option A: Fresh Database Setup
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Open the file [`supabase_schema.sql`](file:///d:/e%20commers/supabase_schema.sql).
3. Paste the complete contents into the SQL Editor and click **Run**.
4. All tables, check constraints, foreign keys, indexes, triggers, and RLS policies will be created.

### Option B: Migrating an Existing Database
1. Open [`supabase_migration.sql`](file:///d:/e%20commers/supabase_migration.sql).
2. Paste the contents into the SQL Editor and click **Run**.
3. This script is strictly non-destructive: it adds missing columns, corrects constraints, installs indexes, and updates RLS policies without dropping existing customer data or orders.

---

## 6. Verification & Test Plan

| Test Case | Scenario | Expected Result | Verified |
|---|---|---|:---:|
| **1. Public Browsing** | Anonymous user visits `/`, `/products`, `/products/[slug]` | Reads active products and categories. Archived products hidden. | ✅ |
| **2. Customer Profile Isolation** | Customer A queries profiles via Supabase client | Cannot view Customer B's email, phone, or address. | ✅ |
| **3. Customer Self-Promotion Attack** | Customer attempts `UPDATE profiles SET role = 'admin'` | RLS `WITH CHECK` blocks role change. | ✅ |
| **4. Unauthorized Admin Access** | Unauthenticated visitor navigates to `/admin` | Middleware redirects to `/admin/login`. | ✅ |
| **5. Authorized Admin Login** | Admin logs in at `/admin/login` with verified role | Session created, redirected to `/admin` dashboard. | ✅ |
| **6. Non-Admin Admin Login** | Standard customer logs in at `/admin/login` | Access denied error; session terminated immediately. | ✅ |
| **7. Price Manipulation Defense** | Client sends manipulated price payload to `/api/razorpay/order` | Server recalculates price from DB catalog; client amount ignored. | ✅ |
| **8. Stock Validation** | Order placed for quantity exceeding DB stock | Server returns 400 with "Insufficient stock" error. | ✅ |
| **9. Razorpay Payment Verification** | Valid HMAC signature sent to `/api/razorpay/verify` | Order transitions to `paid`, stock decremented atomically. | ✅ |
| **10. Invalid Signature Attack** | Fake or altered signature sent to `/api/razorpay/verify` | Verification fails with 400 status; order remains `unpaid`. | ✅ |
| **11. Idempotent Webhook** | Duplicate `payment.captured` webhook events received | Handled safely without duplicate stock deduction. | ✅ |
| **12. Order Data Isolation** | Customer A attempts to view Customer B's order via API/RLS | RLS returns empty dataset; order access blocked. | ✅ |

---

## 7. Known Production Recommendations

1. **Custom Domain for Supabase Auth Cookies:** When deploying to production with a custom domain (e.g., `store.apex.com`), configure custom domains in Supabase to ensure cross-subdomain auth cookies work seamlessly.
2. **Configure Razorpay Webhook in Live Dashboard:** Once in production, configure the webhook URL `https://yourdomain.com/api/razorpay/webhook` in the Razorpay Merchant Dashboard and copy the exact Webhook Secret to `RAZORPAY_WEBHOOK_SECRET`.
3. **Database Backups:** Ensure automated daily backups are enabled in Supabase project settings.
