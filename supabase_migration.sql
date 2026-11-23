-- ==============================================================================
-- ApexStore E-Commerce — Hardened Supabase Database Migration Script (v2.0)
-- Production Security Hardening & Zero-Data-Loss Migration
--
-- Can be safely executed multiple times (idempotent).
-- Does NOT drop tables or delete customer/product records.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. SAFELY ADD MISSING COLUMNS
-- ------------------------------------------------------------------------------
alter table public.profiles
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

alter table public.categories
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

alter table public.products
  add column if not exists sizes text[] default '{}',
  add column if not exists colors jsonb default '[]'::jsonb,
  add column if not exists material text,
  add column if not exists fit text,
  add column if not exists is_trending boolean default false not null,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Correct compare_price constraint to safely permit NULL values
alter table public.products drop constraint if exists products_compare_price_check;
alter table public.products add constraint products_compare_price_check
  check (compare_price is null or compare_price >= price);

alter table public.orders
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Add unique constraint on razorpay_order_id defensively (avoid crashing if duplicate mock data exists)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_razorpay_order_id_key') then
    begin
      alter table public.orders add constraint orders_razorpay_order_id_key unique (razorpay_order_id);
    exception when others then
      raise notice 'Could not apply unique constraint on razorpay_order_id due to existing duplicate rows. Standard index applied instead.';
    end;
  end if;
end $$;

alter table public.order_items
  add column if not exists size text,
  add column if not exists color text;

-- ------------------------------------------------------------------------------
-- 3. CREATE PERFORMANCE & INTEGRITY INDEXES
-- ------------------------------------------------------------------------------
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_products_is_trending on public.products(is_trending);
create index if not exists idx_products_is_archived on public.products(is_archived);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_customer_email on public.orders(customer_email);
create index if not exists idx_orders_razorpay_order_id on public.orders(razorpay_order_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- ------------------------------------------------------------------------------
-- 4. HARDENED FUNCTIONS & SECURITY DEFINERS
-- Explicit search_path set to prevent schema hijacking
-- ------------------------------------------------------------------------------

-- Function: Auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trigger_profiles_updated_at on public.profiles;
create trigger trigger_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_categories_updated_at on public.categories;
create trigger trigger_categories_updated_at
before update on public.categories
for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_products_updated_at on public.products;
create trigger trigger_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_orders_updated_at on public.orders;
create trigger trigger_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

-- Function: Non-recursive is_admin() role check
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select (
    current_user in ('postgres', 'supabase_admin', 'service_role')
    or coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );
$$;

grant execute on function public.is_admin() to authenticated, anon, service_role, postgres;

-- Function: Trigger to prevent unauthorized role escalation on profiles
-- Eliminates RLS recursive self-queries by enforcing role immutability in PL/pgSQL
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role then
    if current_user in ('postgres', 'supabase_admin', 'service_role')
       or (coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role')
       or public.is_admin() then
      return new;
    else
      raise exception 'Unauthorized: Modifying user role is restricted to administrators.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_prevent_profile_role_change on public.profiles;
create trigger trigger_prevent_profile_role_change
before update on public.profiles
for each row execute function public.prevent_profile_role_change();

-- Function: Auto-create customer profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Function: Secure Atomic Stock Decrement
-- Validates quantity, decrements stock atomically, and restricts execution to service_role
create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- 1. Parameter Validation
  if p_product_id is null then
    raise exception 'Product ID cannot be null';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity to decrement must be a positive integer, received %', p_quantity;
  end if;

  -- 2. Atomic Decrement with Race Condition Protection
  update public.products
  set stock = stock - p_quantity
  where id = p_product_id
    and stock >= p_quantity;

  if not found then
    raise exception 'Insufficient stock or invalid product ID: %', p_product_id;
  end if;
end;
$$;

-- Restrict decrement_stock: NEVER allow direct invocation from PUBLIC, anon or authenticated
revoke all on function public.decrement_stock(uuid, integer) from public, anon, authenticated;
grant execute on function public.decrement_stock(uuid, integer) to service_role, postgres;

-- ------------------------------------------------------------------------------
-- 5. AUDIT & PURGE ALL LEGACY POLICIES (DYNAMIC CLEANUP)
-- Drops all existing policies on core tables regardless of naming convention
-- ------------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'categories', 'products', 'orders', 'order_items')
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ------------------------------------------------------------------------------
-- 6. RE-APPLY STRICT PRODUCTION ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- PROFILES POLICIES
-- Customers can view only their own profile
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

-- Customers can update own profile (role immutability guarded by trigger)
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- Self-registration on signup
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id or public.is_admin());

-- CATEGORIES POLICIES
-- Public catalog browsing
create policy "categories_public_select"
on public.categories for select
using (true);

-- Admin only category mutation
create policy "categories_admin_all"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

-- PRODUCTS POLICIES
-- Public can only see active non-archived products; admins can view all
create policy "products_select"
on public.products for select
using (not is_archived or public.is_admin());

-- Admin only product additions, edits, and deletions
create policy "products_admin_all"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

-- ORDERS POLICIES
-- Customers can only view their own orders; admins can view all orders
create policy "orders_select"
on public.orders for select
using (auth.uid() = user_id or public.is_admin());

-- Direct customer order creation from browser is RESTRICTED.
-- All customer and guest orders MUST be created through the trusted server API
-- (/api/razorpay/order) using the service role.
-- Authenticated admins retain full management access.
create policy "orders_admin_all"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

-- ORDER ITEMS POLICIES
-- Customers can only view line items for their own orders
create policy "order_items_select"
on public.order_items for select
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
  or public.is_admin()
);

-- Direct client insertion into order_items is completely BLOCKED.
-- Order items are persisted exclusively through the server API via service role.
create policy "order_items_admin_all"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

-- ==============================================================================
-- INITIAL ADMIN PROVISIONING INSTRUCTIONS:
--
-- 1. Create your administrator user in Supabase Dashboard -> Authentication -> Users.
-- 2. Run the following command once in the SQL Editor:
--
--    UPDATE public.profiles
--    SET role = 'admin'
--    WHERE email = 'your-admin@apexstore.com';
-- ==============================================================================
