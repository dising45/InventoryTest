-- ============================================================
-- InventoryPro — Complete Supabase Schema
-- Generated from actual Supabase table dump (reference/)
-- ============================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cost_price numeric DEFAULT 0,
  sell_price numeric DEFAULT 0,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  has_variants boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Variants
CREATE TABLE IF NOT EXISTS public.variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  name text NOT NULL,
  sku text,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  price_modifier numeric DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Sales Orders
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  discount_type text DEFAULT 'flat',
  tax numeric DEFAULT 0,
  tax_type text DEFAULT 'percentage',
  total_amount numeric DEFAULT 0,
  order_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Sales Items
CREATE TABLE IF NOT EXISTS public.sales_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  variant_id uuid,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric,
  cost_price numeric DEFAULT 0,
  line_total numeric,
  created_at timestamptz DEFAULT now()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid,
  po_number text UNIQUE,
  total_amount numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Purchase Items
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL,
  product_id uuid,
  variant_id uuid,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_cost numeric DEFAULT 0,
  line_total numeric
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date date NOT NULL,
  category text NOT NULL,
  description text,
  amount numeric NOT NULL CHECK (amount >= 0),
  payment_mode text,
  reference text,
  vendor text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

-- Variants → Products
ALTER TABLE public.variants
  ADD CONSTRAINT variants_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id);

-- Sales Orders → Customers
ALTER TABLE public.sales_orders
  ADD CONSTRAINT sales_orders_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);

-- Sales Items → Sales Orders, Products, Variants
ALTER TABLE public.sales_items
  ADD CONSTRAINT sales_items_sales_order_id_fkey
  FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id);

ALTER TABLE public.sales_items
  ADD CONSTRAINT sales_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE public.sales_items
  ADD CONSTRAINT sales_items_variant_id_fkey
  FOREIGN KEY (variant_id) REFERENCES public.variants(id);

-- Purchase Orders → Suppliers
ALTER TABLE public.purchase_orders
  ADD CONSTRAINT purchase_orders_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- Purchase Items → Purchase Orders, Products, Variants
ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_purchase_order_id_fkey
  FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);

ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_variant_id_fkey
  FOREIGN KEY (variant_id) REFERENCES public.variants(id);

-- ============================================================
-- INDEXES (for foreign key performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.variants(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON public.sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_sales_order_id ON public.sales_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_product_id ON public.sales_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_variant_id ON public.sales_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_order_id ON public.purchase_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON public.purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Open access for now — update to auth.uid() in Phase 6
-- ============================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Customers Policies
CREATE POLICY "Allow all select on customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow all insert on customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on customers" ON public.customers FOR DELETE USING (true);

-- Suppliers Policies
CREATE POLICY "Allow all select on suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow all insert on suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on suppliers" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on suppliers" ON public.suppliers FOR DELETE USING (true);

-- Products Policies
CREATE POLICY "Allow all select on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow all insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on products" ON public.products FOR DELETE USING (true);

-- Variants Policies
CREATE POLICY "Allow all select on variants" ON public.variants FOR SELECT USING (true);
CREATE POLICY "Allow all insert on variants" ON public.variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on variants" ON public.variants FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on variants" ON public.variants FOR DELETE USING (true);

-- Sales Orders Policies
CREATE POLICY "Allow all select on sales_orders" ON public.sales_orders FOR SELECT USING (true);
CREATE POLICY "Allow all insert on sales_orders" ON public.sales_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on sales_orders" ON public.sales_orders FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on sales_orders" ON public.sales_orders FOR DELETE USING (true);

-- Sales Items Policies
CREATE POLICY "Allow all select on sales_items" ON public.sales_items FOR SELECT USING (true);
CREATE POLICY "Allow all insert on sales_items" ON public.sales_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on sales_items" ON public.sales_items FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on sales_items" ON public.sales_items FOR DELETE USING (true);

-- Purchase Orders Policies
CREATE POLICY "Allow all select on purchase_orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow all insert on purchase_orders" ON public.purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on purchase_orders" ON public.purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on purchase_orders" ON public.purchase_orders FOR DELETE USING (true);

-- Purchase Items Policies
CREATE POLICY "Allow all select on purchase_items" ON public.purchase_items FOR SELECT USING (true);
CREATE POLICY "Allow all insert on purchase_items" ON public.purchase_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on purchase_items" ON public.purchase_items FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on purchase_items" ON public.purchase_items FOR DELETE USING (true);

-- Expenses Policies
CREATE POLICY "Allow all select on expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow all insert on expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on expenses" ON public.expenses FOR DELETE USING (true);