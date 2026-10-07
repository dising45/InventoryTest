-- ============================================================
-- Zero historical COGS for one business (direct-expense model)
-- Run ONCE in the Supabase SQL editor.
-- ============================================================
--
-- WHO:
--   owner_id = '67235689-03a5-4ebf-884a-b54abfe0b6d3'  (food business)
--
-- WHY:
--   This business records all raw-material purchases directly in
--   Expenses. Each sale line also snapshotted products.cost_price into
--   sales_items.cost_price, and the P&L / dashboard compute
--   COGS = cost_price * quantity. With the cost already in Expenses,
--   booking COGS too subtracts the same cost twice and understates net
--   profit. She has since set her product cost prices to ₹0, so NEW
--   sales already book COGS = 0 — but existing sale lines kept the old
--   locked-in cost. This zeroes those historical lines.
--
-- SCOPE:
--   Only this owner's sales_items. No other business is touched.
--   products are NOT changed (already ₹0 for her).
--
-- SAFETY:
--   * Backs up the current (id, cost_price) of every affected line into
--     sales_items_cogs_backup_20261007 BEFORE updating — fully reversible.
--   * Wrapped in a transaction; the verification SELECTs run after commit.
-- ============================================================

BEGIN;

-- 1️⃣ Backup current values (reversible).
CREATE TABLE IF NOT EXISTS public.sales_items_cogs_backup_20261007 AS
SELECT id, cost_price
FROM public.sales_items
WHERE owner_id = '67235689-03a5-4ebf-884a-b54abfe0b6d3';

-- 2️⃣ Zero COGS on this owner's historical sale lines.
UPDATE public.sales_items
SET cost_price = 0
WHERE owner_id = '67235689-03a5-4ebf-884a-b54abfe0b6d3'
  AND cost_price <> 0;

COMMIT;

-- 3️⃣ Verify: expect remaining_nonzero = 0, backup_rows = total lines.
SELECT
  (SELECT count(*) FROM public.sales_items
     WHERE owner_id = '67235689-03a5-4ebf-884a-b54abfe0b6d3'
       AND cost_price <> 0)                              AS remaining_nonzero,
  (SELECT count(*) FROM public.sales_items_cogs_backup_20261007) AS backup_rows;

-- ------------------------------------------------------------
-- TO UNDO (if ever needed):
--   UPDATE public.sales_items si
--   SET cost_price = b.cost_price
--   FROM public.sales_items_cogs_backup_20261007 b
--   WHERE si.id = b.id;
-- ------------------------------------------------------------
