# Vendor Bills v2 — Charges, Paid Status & Expense Wiring

**Date:** 2026-09-30
**Status:** Approved design, ready for implementation plan

## Problem

Vendor bills currently record only item lines. The owner has no way to capture
shipping, packaging or other add-on charges, or a vendor discount, and no way to
mark a bill paid. As a workaround she has been entering vendor payments — including
the **stock cost itself** — directly into the Expenses tab. That double-counts:
the app already recognizes stock cost as **COGS** (from the `cost_price` snapshot on
each sale line) when an item sells. Counting it again as an expense understates net
profit and makes it lumpy.

## Reporting model (the decision this design enforces)

Every rupee that leaves the business belongs to exactly one bucket, counted once:

| Money | Bucket | When it hits profit |
|---|---|---|
| Item cost | Inventory → `cost_price` | As **COGS**, when the item sells |
| Add-on charges (shipping, packaging, …) | **Expenses** | Immediately, when the bill is marked paid |
| Vendor discount | Reduces item cost basis | Flows through COGS |

Stock cost is **never** an operating expense. Add-ons **always** are. This keeps the
existing P&L math (`net = revenue − COGS − expenses`) correct with no double-count.

## Cutover & legacy cleanup (owner workflow, not code)

- **Cutover = today (30 Sep 2026).** Current inventory (manually corrected quantities
  + each product's `cost_price`) is the opening position and already carries the cost
  of goods on hand. No historical bills need reconstructing.
- The owner will **delete** the historical stock-purchase expense rows (categories
  `Sarees`, `Sarees Stock`, `Stock Order` — ~₹58,200 visible, possibly more).
- She may optionally re-enter old purchases as **legacy bills** (see below) to keep a
  record and to move their shipping portion into expenses correctly.
- Accepted imperfection: stock bought *and* sold before cutover had its cost in
  expenses rather than COGS in those closed months. Not reconstructed.

## Feature scope

### In v1
1. **Additional charges** — a flexible list of `{ description, amount, category }`
   lines on a bill. Each becomes its own Expense row when the bill is marked paid.
2. **Discount** — flat or percent, reduces the goods cost basis proportionally across
   item lines (so `cost_price` reflects what was actually paid).
3. **Paid / Unpaid status** — marking Paid creates the charge expenses; un-paying or
   deleting the bill removes them (no orphans).
4. **Editable bill date** — enables back-dated / legacy bills; also used as the
   expense date for generated charges.
5. **Legacy toggle** — a documentation-only bill. Records vendor / date / stock-cost /
   charges and posts charges to expenses, but **never touches stock or `cost_price`**
   and **never creates new products**.
6. **Full edit** — every field editable after save, including item lines. Editing
   items on a non-legacy bill reverses the old stock movement and re-applies the new
   one (reuse `adjustStock`), then recomputes `cost_price` and syncs charge expenses.

### Future (out of scope)
- OCR to auto-read line items from a photo of the paper bill.
- Bill photo attachment (deferred; will reuse the existing
  `imageService.uploadProductImage` + `Compressor` pipeline when built).
- A separate "cash out this month" figure.

## Data model changes (Supabase)

### `purchase_orders` — add columns
| Column | Type | Notes |
|---|---|---|
| `bill_date` | `date` | Defaults to today; editable; used as expense date |
| `discount` | `numeric` default `0` | |
| `discount_type` | `text` default `'flat'` | `'flat'` \| `'percent'` |
| `status` | `text` default `'unpaid'` | `'unpaid'` \| `'paid'` |
| `paid_at` | `timestamptz` null | Set when marked paid |
| `is_legacy` | `boolean` default `false` | Documentation-only bill |

`total_amount` becomes `goodsSubtotal − discountValue + Σ charges` (see calc below).

### New table `purchase_charges`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` pk | |
| `purchase_order_id` | `uuid` fk → `purchase_orders` | cascade delete |
| `description` | `text` | e.g. "Courier", "Thank-you cards" |
| `amount` | `numeric` | |
| `category` | `text` | expense category, e.g. `Shipping`, `Packaging`, `Other` |
| `expense_id` | `uuid` null | link to the generated expense; null while unpaid |

No change to the `expenses` table. Linkage is tracked on the charge row
(`purchase_charges.expense_id`), so bill → charge → expense is one-directional and
easy to sync. Generated expenses use the standard `expenseService.addExpense` fields.

## Calculations

```
goodsSubtotal = Σ (item.quantity × item.unit_cost)
discountValue = discount_type === 'percent'
                  ? goodsSubtotal × (discount / 100)
                  : discount
chargesTotal  = Σ (charge.amount)
total_amount  = goodsSubtotal − discountValue + chargesTotal

// per-item cost basis, discount distributed proportionally by line value
scale               = goodsSubtotal > 0 ? (goodsSubtotal − discountValue) / goodsSubtotal : 1
item.effectiveCost  = round(item.unit_cost × scale, 2)   // written to products.cost_price
```

Legacy bills skip the `effectiveCost` → `cost_price` write and skip stock changes.

## Service changes (`services/purchaseService.supabase.ts`)

- **`createPO`** — accept `bill_date`, `discount`, `discount_type`, `status`,
  `is_legacy`, and `charges[]`. Insert charge rows. For non-legacy: adjust stock and
  write `effectiveCost` to `cost_price` (current behaviour, now discount-aware). For
  legacy: skip stock/cost writes and skip new-product creation (existing products
  only). If created with `status === 'paid'`, generate charge expenses.
- **`updatePO(poId, data)`** — new. Load existing bill. For non-legacy, reverse old
  stock (`adjustStock(oldItems, 'deduct')`), delete + re-insert items, re-apply stock,
  recompute `cost_price`. Replace charge rows. Re-sync expenses to match the current
  charge set and paid status.
- **`markPaid(poId)` / `markUnpaid(poId)`** — flip `status`/`paid_at`; create or delete
  the linked charge expenses and set/clear `purchase_charges.expense_id`.
- **`deletePO`** — existing stock rollback (skipped for legacy) **plus** delete any
  linked charge expenses; charge rows cascade with the PO.
- **Expense generation helper** — for each charge, `addExpense({ expense_date: bill_date,
  category: charge.category, description: charge.description, amount: charge.amount,
  vendor: supplierName, reference: po_number ?? poId })`, then store the returned id on
  the charge.

Known limitation (v1): if the owner manually deletes an auto-generated expense from the
Expenses tab, the charge's `expense_id` dangles. Acceptable for now; the description
makes such rows recognizable. Re-toggling paid can be the recovery path.

## Types (`types.ts`)

- Extend `PurchaseOrder`: `bill_date`, `discount?`, `discount_type?`, `status`,
  `is_legacy`, `charges?: PurchaseCharge[]`.
- Add `PurchaseCharge { id?; purchase_order_id?; description; amount; category; expense_id? }`.
- Extend `createPO` / `updatePO` param types accordingly.

## Hook (`hooks/usePurchases.ts`)

Add `updatePO`, `markPaid`, `markUnpaid`; each calls the service then `load()`.

## UI changes

- **`PurchaseOrderForm.tsx`** — add: bill-date picker, discount field (amount +
  flat/percent toggle), a repeatable **Additional charges** section (description +
  amount + category per row), a **Legacy bill** toggle, and a totals breakdown
  (goods subtotal − discount + charges = total). Support **edit mode** (prefill from an
  existing bill). Offer "Save" and "Save & mark paid". When legacy is on, disable
  inline new-product creation and hide/disable stock-affecting hints.
- **`PurchaseItemRow.tsx`** — respect a `legacy`/`allowCreate=false` prop to disable
  new-product creation.
- **`PurchaseOrderList.tsx`** — show a **Paid/Unpaid** badge and a **Legacy** tag; add
  **Mark paid / Mark unpaid**, **Edit**, and **Delete** actions.
- **`App.tsx`** — wire `editingPO` into the form for editing; after any save / edit /
  paid-toggle, call `reloadProducts()` **and** reload the expenses hook so the Expenses
  and Dashboard views immediately reflect generated rows.

## Verification

1. Run the SQL migration (new columns + `purchase_charges` table).
2. Create a bill: 2 items + a ₹150 "Courier" shipping charge + 5% discount. Save.
   - Inventory stock increases; `cost_price` reflects the discounted unit cost.
   - No expense yet (status unpaid).
3. Mark the bill **Paid** → a ₹150 Shipping expense appears in Expenses (date = bill
   date, vendor = supplier); Dashboard net profit drops by exactly ₹150, not by the
   stock cost.
4. Mark **Unpaid** → the ₹150 expense disappears; no orphan.
5. Edit the paid bill: change courier to ₹200, add a "Packaging ₹100" charge, change an
   item quantity. Save → stock re-reconciles; Shipping expense updates to ₹200; a ₹100
   Packaging expense is added.
6. Delete the bill → stock rolls back; all its charge expenses are removed.
7. Create a **legacy** bill (back-dated) with a stock cost + ₹300 shipping, marked paid
   → stock is **unchanged**, `cost_price` unchanged, and only the ₹300 shipping shows in
   Expenses on the bill date.
8. All other views (Sales, P&L, Customers, Suppliers) continue to work; `tsc --noEmit`
   is clean.
