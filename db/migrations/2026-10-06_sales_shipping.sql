-- Add a flat shipping charge to sales orders.
-- Shipping is a flat rupee amount added to the order total (after discount + tax),
-- mirroring how `discount` and `tax` already fold into `total_amount`.
-- Idempotent: safe to run more than once.

alter table sales_orders
  add column if not exists shipping numeric not null default 0;
