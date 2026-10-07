-- ============================================================
-- Add quantity + unit of measure to expenses
-- Run ONCE in the Supabase SQL editor. Idempotent, additive.
-- ============================================================
--
-- WHY:
--   Some expenses are purchases of physical stuff (e.g. 10 kg flour).
--   These optional columns let a user record how much was bought and in
--   what unit. They are purely descriptive — the expense Amount is still
--   entered as the total and is NOT derived from these.
--
-- SAFETY:
--   * Nullable, no default — every existing expense keeps NULL and is
--     unaffected. Non-"stuff" expenses (rent, salary) simply leave them blank.
--   * Removes no data.
-- ============================================================

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS quantity numeric,
  ADD COLUMN IF NOT EXISTS unit text;
