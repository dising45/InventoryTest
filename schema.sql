-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Customers
create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Suppliers
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_person text,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text not null unique,
  description text,
  price numeric(10, 2) not null default 0,
  stock_quantity integer not null default 0, -- Direct stock if no variants
  has_variants boolean not null default false,
  supplier_id uuid references suppliers(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Variants
create table variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null, -- e.g., "Size: L, Color: Red"
  sku text not null, -- Unique per variant
  price_adjustment numeric(10, 2) default 0,
  stock_quantity integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, sku)
);

-- 5. Sales Orders
create table sales_orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete set null,
  status text not null check (status in ('pending', 'completed', 'cancelled')) default 'pending',
  total_amount numeric(10, 2) not null default 0,
  sale_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Sales Items
create table sales_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references sales_orders(id) on delete cascade,
  product_id uuid not null references products(id),
  variant_id uuid references variants(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  subtotal numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Expenses
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  amount numeric(10, 2) not null,
  category text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  supplier_id uuid references suppliers(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_products_sku on products(sku);
create index idx_variants_product_id on variants(product_id);
create index idx_sales_orders_customer_id on sales_orders(customer_id);
create index idx_sales_items_order_id on sales_items(order_id);
create index idx_expenses_date on expenses(date);

-- DATABASE FUNCTION: Handle Inventory Deduction Safely
-- This RPC function ensures atomicity when creating a sale
create or replace function create_sale_transaction(
  p_customer_id uuid,
  p_total_amount numeric,
  p_items jsonb
) returns uuid as $$
declare
  v_order_id uuid;
  item jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_qty int;
  v_price numeric;
  v_subtotal numeric;
begin
  -- 1. Create Order
  insert into sales_orders (customer_id, total_amount, status)
  values (p_customer_id, p_total_amount, 'completed')
  returning id into v_order_id;

  -- 2. Process Items
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_variant_id := (item->>'variant_id')::uuid;
    v_qty := (item->>'quantity')::int;
    v_price := (item->>'unit_price')::numeric;
    v_subtotal := (item->>'subtotal')::numeric;

    -- Insert Item
    insert into sales_items (order_id, product_id, variant_id, quantity, unit_price, subtotal)
    values (v_order_id, v_product_id, v_variant_id, v_qty, v_price, v_subtotal);

    -- Update Stock
    if v_variant_id is not null then
      update variants set stock_quantity = stock_quantity - v_qty where id = v_variant_id;
    else
      update products set stock_quantity = stock_quantity - v_qty where id = v_product_id;
    end if;
  end loop;

  return v_order_id;
end;
$$ language plpgsql;
