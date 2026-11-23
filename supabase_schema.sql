-- ==============================================================================
-- ApexStore E-Commerce — Production-Grade Supabase PostgreSQL Schema (v2.0)
-- Includes Hardened Row Level Security (RLS), Role-Based Access, Triggers, & Atomic Functions
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. PROFILES (Customers and Admins linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text default 'customer' not null check (role in ('customer', 'admin')),
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CATEGORIES
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PRODUCTS
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  compare_price numeric(10, 2) check (compare_price is null or compare_price >= price),
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  images text[] default '{}',
  sizes text[] default '{}',
  colors jsonb default '[]'::jsonb,
  material text,
  fit text,
  stock integer default 0 not null check (stock >= 0),
  is_featured boolean default false not null,
  is_trending boolean default false not null,
  is_archived boolean default false not null,
  rating numeric(3, 2) default 5.0 check (rating >= 0 and rating <= 5.0),
  reviews_count integer default 0 check (reviews_count >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  currency text default 'INR' not null,
  status text default 'pending' not null check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text default 'unpaid' not null check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ORDER ITEMS
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  product_image text,
  size text,
  color text,
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  total numeric(10, 2) not null check (total >= 0)
);

-- ==============================================================================
-- INDEXES FOR QUERY OPTIMIZATION & INTEGRITY
-- ==============================================================================
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

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. Auto-update updated_at timestamp
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

-- 2. Non-recursive Admin Verification Function
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

-- 3. Trigger to prevent unauthorized role escalation on profiles
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
 
-- 4. Automatic Profile Creation on auth.users Signup
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

-- 5. Atomic Stock Decrement Function
create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_product_id is null then
    raise exception 'Product ID cannot be null';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity to decrement must be a positive integer, received %', p_quantity;
  end if;

  update public.products
  set stock = stock - p_quantity
  where id = p_product_id
    and stock >= p_quantity;

  if not found then
    raise exception 'Insufficient stock or invalid product ID: %', p_product_id;
  end if;
end;
$$;

revoke all on function public.decrement_stock(uuid, integer) from public, anon, authenticated;
grant execute on function public.decrement_stock(uuid, integer) to service_role, postgres;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id or public.is_admin());

-- CATEGORIES
drop policy if exists "categories_public_select" on public.categories;
create policy "categories_public_select"
on public.categories for select
using (true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

-- PRODUCTS
drop policy if exists "products_select" on public.products;
create policy "products_select"
on public.products for select
using (not is_archived or public.is_admin());

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

-- ORDERS
drop policy if exists "orders_select" on public.orders;
create policy "orders_select"
on public.orders for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

-- ORDER ITEMS
drop policy if exists "order_items_select" on public.order_items;
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

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());
