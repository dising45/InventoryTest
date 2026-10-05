-- ============================================================
-- Multi-Tenant Auth & Data Isolation — ROLLBACK
-- Reverses 2026-10-05_multi_tenant.sql. Run in the Supabase SQL editor.
--
-- WHAT THIS DOES:
--   * Disables RLS and drops the owner-only policies (DB open again).
--   * Drops the owner_id columns (this also drops the per-owner
--     unique indexes that depended on them).
--   * Restores the original global products.sku unique index.
--   * Drops the storage folder policies.
--
-- WHAT THIS DOES NOT DO:
--   * It NEVER deletes business data. owner_id is only a tenant tag;
--     removing it leaves every product/sale/customer/etc. row intact.
--   * After rollback the app behaves exactly as it did pre-migration
--     (no login isolation). Pair with reverting the client code (git).
--
-- Idempotent: safe to re-run.
-- ============================================================

-- STEP 1 — Drop storage policies.
DROP POLICY IF EXISTS owner_insert_images ON storage.objects;
DROP POLICY IF EXISTS owner_update_images ON storage.objects;
DROP POLICY IF EXISTS owner_delete_images ON storage.objects;

-- STEP 2 — Disable RLS + drop owner policies on every table.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','variants','customers','suppliers','sales_orders',
    'sales_items','purchase_orders','purchase_items','purchase_charges','expenses'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'owner_all_' || t, t);
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- STEP 3 — Drop owner_id columns (CASCADE removes the per-owner
-- unique indexes products_sku_owner_unique / variants_sku_owner_unique).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','variants','customers','suppliers','sales_orders',
    'sales_items','purchase_orders','purchase_items','purchase_charges','expenses'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS owner_id CASCADE', t);
  END LOOP;
END $$;

-- STEP 4 — Restore the original global SKU unique index.
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique
  ON products (sku) WHERE sku IS NOT NULL AND sku <> '';

-- ============================================================
-- Database is back to its pre-migration shape. Data preserved.
-- ============================================================
