-- Enable UUID extension (usually enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  buy_price numeric not null default 0,
  sell_price numeric not null default 0,
  stock integer not null default 0,
  has_variants boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create variants table
create table public.variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null,
  sku text,
  stock integer not null default 0,
  price_modifier numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.variants enable row level security;

-- Create policies (Allowing public access for demo purposes)
-- IMPORTANT: In a production app with authentication, you should change these policies
-- to check for 'auth.uid()' or specific roles.

-- Products Policies
create policy "Enable read access for all users" on public.products for select using (true);
create policy "Enable insert access for all users" on public.products for insert with check (true);
create policy "Enable update access for all users" on public.products for update using (true);
create policy "Enable delete access for all users" on public.products for delete using (true);

-- Variants Policies
create policy "Enable read access for all users" on public.variants for select using (true);
create policy "Enable insert access for all users" on public.variants for insert with check (true);
create policy "Enable update access for all users" on public.variants for update using (true);
create policy "Enable delete access for all users" on public.variants for delete using (true);
