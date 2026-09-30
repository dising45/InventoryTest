-- ============================================================
-- Vendor Bills v2 — migration
-- Run this ONCE in the Supabase SQL editor before using the app.
-- Safe to re-run (idempotent).
-- ============================================================

-- 1) New columns on purchase_orders
ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS bill_date     date        NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS discount      numeric     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_type text        NOT NULL DEFAULT 'flat',   -- 'flat' | 'percent'
  ADD COLUMN IF NOT EXISTS status        text        NOT NULL DEFAULT 'unpaid', -- 'unpaid' | 'paid'
  ADD COLUMN IF NOT EXISTS paid_at       timestamptz,
  ADD COLUMN IF NOT EXISTS is_legacy     boolean     NOT NULL DEFAULT false;

-- Backfill bill_date for existing rows from their created_at
UPDATE purchase_orders
SET bill_date = created_at::date
WHERE bill_date IS NULL;

-- 2) Flexible add-on charge lines (shipping, packaging, ...)
CREATE TABLE IF NOT EXISTS purchase_charges (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id  uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  description        text,
  amount             numeric NOT NULL DEFAULT 0,
  category           text    NOT NULL DEFAULT 'Other',  -- expense category
  expense_id         uuid REFERENCES expenses(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchase_charges_po_idx
  ON purchase_charges(purchase_order_id);
