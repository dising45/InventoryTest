-- ============================================================
-- B2B Pricing Migration for existing Naitree/InventoryPro data
-- ============================================================
-- Purpose:
-- 1. Add B2B selling price to existing inventory products
-- 2. Initialize existing product B2B price as buying price + ₹100
-- 3. Add order_type to sales orders
-- 4. Mark all existing historical orders as B2C
--
-- Run this once in Supabase SQL Editor.
-- ============================================================

-- 1) Add B2B price column to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS b2b_sell_price numeric;

-- 2) Backfill existing products using your current rule:
--    B2B Selling Price = Buying Price + ₹100
UPDATE public.products
SET b2b_sell_price = COALESCE(cost_price, 0) + 100
WHERE b2b_sell_price IS NULL;

-- 3) Add order_type to sales orders.
--    Existing orders are B2C by default.
ALTER TABLE public.sales_orders
ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'B2C';

-- 4) Backfill historical orders as B2C
UPDATE public.sales_orders
SET order_type = 'B2C'
WHERE order_type IS NULL;

-- 5) Add validation constraint for order type, safely.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_orders_order_type_check'
  ) THEN
    ALTER TABLE public.sales_orders
    ADD CONSTRAINT sales_orders_order_type_check
    CHECK (order_type IN ('B2C', 'B2B'));
  END IF;
END $$;

-- 6) Add index for future B2B/B2C reporting filters
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_type
ON public.sales_orders(order_type);