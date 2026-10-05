-- ============================================================
-- Multi-Tenant Auth & Data Isolation — migration
-- Run this ONCE in the Supabase SQL editor.
--
-- PREREQUISITES (do these FIRST, see plan Part 2):
--   1. Create the Naitree owner account in
--      Authentication -> Users -> Add user (auto-confirm).
--      Set its user_metadata to {"business_name":"Naitree"}.
--   2. Put that account's LOGIN EMAIL in OWNER_EMAIL below.
--
-- SAFETY:
--   * Take the data dump first (backups/ — already done).
--   * The whole script runs as ONE transaction in the SQL editor,
--     so if the abort gate (STEP 3) fires, EVERYTHING rolls back
--     and the database is left exactly as it was.
--   * Reversible via 2026-10-05_multi_tenant_rollback.sql.
--   * Idempotent: safe to re-run.
-- ============================================================

-- The 10 tables secured by this migration.
-- (kept as a CTE-style array reused by every DO block below)

-- ------------------------------------------------------------
-- STEP 1 — Add owner_id to every table.
-- default auth.uid() auto-stamps the logged-in user's id on every
-- INSERT, which is why the data services need no query changes.
-- ------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','variants','customers','suppliers','sales_orders',
    'sales_items','purchase_orders','purchase_items','purchase_charges','expenses'
  ]
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ADD COLUMN IF NOT EXISTS owner_id uuid '
      || 'REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()', t);
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- STEP 2 — Backfill existing rows to the Naitree owner.
-- *** THE SAFEGUARD STEP: assigns all current data to Naitree ***
-- Replace OWNER_EMAIL with the Naitree owner's login email.
--
-- Some tables (e.g. purchase_orders) have immutability triggers
-- that reject ANY update. This is a metadata-only owner_id stamp,
-- so we briefly disable each table's enabled user-triggers, do the
-- update, then re-enable exactly the ones we disabled. All inside
-- this transaction, so a rollback restores every trigger.
-- ------------------------------------------------------------
DO $$
DECLARE
  owner_email text := 'DISING45@GMAIL.COM';  -- Naitree owner login email
  owner uuid;
  t text;
  nm text;
  disabled text[];
BEGIN
  -- case-insensitive: Supabase stores emails lowercased
  SELECT id INTO owner FROM auth.users WHERE lower(email) = lower(owner_email);
  IF owner IS NULL THEN
    RAISE EXCEPTION 'Owner account not found for %. Create it in Authentication -> Users first (plan Part 2).', owner_email;
  END IF;

  FOREACH t IN ARRAY ARRAY[
    'products','variants','customers','suppliers','sales_orders',
    'sales_items','purchase_orders','purchase_items','purchase_charges','expenses'
  ]
  LOOP
    -- disable the table's currently-enabled, non-internal triggers
    disabled := ARRAY[]::text[];
    FOR nm IN
      SELECT tgname FROM pg_trigger
      WHERE tgrelid = format('public.%I', t)::regclass
        AND NOT tgisinternal
        AND tgenabled <> 'D'
    LOOP
      EXECUTE format('ALTER TABLE public.%I DISABLE TRIGGER %I', t, nm);
      disabled := array_append(disabled, nm);
    END LOOP;

    EXECUTE format('UPDATE public.%I SET owner_id = $1 WHERE owner_id IS NULL', t) USING owner;

    -- re-enable exactly the ones we disabled (leave others as they were)
    FOREACH nm IN ARRAY disabled
    LOOP
      EXECUTE format('ALTER TABLE public.%I ENABLE TRIGGER %I', t, nm);
    END LOOP;
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- STEP 3 — ABORT GATE. Every table must have 0 unassigned rows.
-- If not, raise -> the whole transaction rolls back. Enabling RLS
-- with unassigned rows would HIDE the owner's own data.
-- ------------------------------------------------------------
DO $$
DECLARE t text; n bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','variants','customers','suppliers','sales_orders',
    'sales_items','purchase_orders','purchase_items','purchase_charges','expenses'
  ]
  LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE owner_id IS NULL', t) INTO n;
    RAISE NOTICE 'owner_id null count — %: %', t, n;
    IF n > 0 THEN
      RAISE EXCEPTION 'Table % still has % unassigned rows — aborting before NOT NULL / RLS', t, n;
    END IF;
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- STEP 4 — Lock owner_id NOT NULL now that every row is assigned.
-- ------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','variants','customers','suppliers','sales_orders',
    'sales_items','purchase_orders','purchase_items','purchase_charges','expenses'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN owner_id SET NOT NULL', t);
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- STEP 5 — Enable RLS + owner-only policy on every table.
-- using  -> controls read/update/delete visibility
-- with check -> blocks writing rows under another owner
-- ------------------------------------------------------------
DO $$
DECLARE t text; pol text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','variants','customers','suppliers','sales_orders',
    'sales_items','purchase_orders','purchase_items','purchase_charges','expenses'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    pol := 'owner_all_' || t;
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol, t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO authenticated '
      || 'USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid())', pol, t);
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- STEP 6 — Make unique constraints per-owner so two businesses
-- never collide on the same value.
-- Known case: products.sku (global unique from prior SKU work).
-- Blank SKUs ('' or NULL) mean "no SKU" and are excluded from the
-- uniqueness check (many rows legitimately have no SKU).
-- AUDIT: if any other global unique index exists (e.g.
-- customer phone/email, supplier name), convert it the same way.
-- ------------------------------------------------------------
DROP INDEX IF EXISTS products_sku_unique;
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_owner_unique
  ON products (owner_id, sku) WHERE sku IS NOT NULL AND sku <> '';

DROP INDEX IF EXISTS variants_sku_unique;
CREATE UNIQUE INDEX IF NOT EXISTS variants_sku_owner_unique
  ON variants (owner_id, sku) WHERE sku IS NOT NULL AND sku <> '';

-- ------------------------------------------------------------
-- STEP 7 — Storage isolation for the product-images bucket.
-- Each business writes only under its own <uid>/ folder.
-- Reads stay public (bucket remains public; files not listable).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS owner_insert_images ON storage.objects;
CREATE POLICY owner_insert_images ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS owner_update_images ON storage.objects;
CREATE POLICY owner_update_images ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS owner_delete_images ON storage.objects;
CREATE POLICY owner_delete_images ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- Done. Verify: log in as Naitree -> all data present; a second
-- account -> sees nothing. See plan "Verification (end-to-end)".
-- ============================================================
