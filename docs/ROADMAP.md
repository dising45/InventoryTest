# Naitree Inventory — Product Roadmap

> Last updated: July 2026
> Status: **MVP / Internal Prototype** — functional but not production-ready

---

## Executive Summary

Naitree is a mobile-first inventory & sales management PWA for small businesses. It covers the core lifecycle — products, variants, customers, suppliers, sales, purchase orders, expenses, and P&L reporting — backed by Supabase.

**Current state:** The app works end-to-end for basic CRUD operations. However, it has significant gaps in polish, data integrity, navigation, and scalability that prevent it from being a real product. This roadmap captures every known issue and planned improvement, prioritized by business impact.

---

## What Works Today ✅

| Area | Status |
|------|--------|
| Product CRUD with variants & images | ✅ Solid |
| Customer / Supplier management | ✅ Solid |
| Sales creation with line items | ✅ Solid |
| Purchase Orders with stock adjustment | ✅ Works |
| Expense tracking with categories | ✅ Solid |
| P&L reporting (revenue - COGS - expenses) | ✅ Works |
| Dashboard with stats & low-stock alerts | ✅ Solid |
| Mobile-first responsive design | ✅ Good |
| PWA installable (manifest + service worker) | ✅ Basic |
| CSV export (sales, expenses) | ✅ Works |
| Custom hooks architecture | ✅ Clean |

---

## Honest Assessment — What's Broken 🔴

### 1. Alert/Confirm dialogs (8 instances)
Browser `alert()` and `confirm()` calls are used for validation errors, success messages, and destructive action confirmation. This is the single biggest thing that makes the app feel like a prototype.

**Files affected:** `App.tsx`, `ProductForm.tsx`, `SalesForm.tsx`, `PurchaseOrderForm.tsx`, `PurchaseOrderList.tsx`

### 2. Type Safety Gaps (21 `any` types)
Despite using TypeScript, critical paths use `any` — including `PurchaseOrderList` props (`purchaseOrders: any[]`), `App.tsx` handlers, and several UI helper components. TypeScript provides zero safety where it matters most.

### 3. PurchaseOrderList is unstyled
Every other list view has polished design (search bars, summary cards, desktop tables, compact mobile rows). PurchaseOrderList is raw unstyled divs with no summary stats, no CSV export, no date filtering, no status management.

### 4. No Data Integrity Safeguards
- Can delete a customer who has active sales
- Can delete a product referenced in sales/purchase orders
- No cascade warnings ("this will affect X records")
- All deletes are hard-deletes — no undo, no archive, no soft-delete

### 5. Navigation is a state variable
`currentView` is a `useState<string>`. No URL routing means: no browser back button support, no deep linking, no bookmarking, no sharing a link to a specific view. On mobile, users expect the back button to work.

### 6. No loading states
No skeleton loaders. Screen is blank while data loads, then suddenly populated. Some empty states are beautifully designed, others (`PurchaseOrderList`) are plain text.

### 7. Performance ceiling
- All lists render every item in the DOM (no virtualization)
- All 5 data hooks fire on app mount simultaneously
- Single 606KB bundle (above the 500KB warning threshold)
- No pagination on any list

### 8. No Business Intelligence
Dashboard shows point-in-time totals. No trends, no "this week vs last week," no top-selling products, no customer lifetime value, no inventory turnover. A business owner needs trends, not just numbers.

---

## Phased Roadmap

### Phase 1: Polish — "Make it feel like a real product"
**Impact: HIGH | Effort: LOW-MEDIUM**

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1.1 | Replace all `alert()` / `confirm()` with toast notification system | `App.tsx`, `ProductForm.tsx`, `SalesForm.tsx`, `PurchaseOrderForm.tsx`, `PurchaseOrderList.tsx` | 2-3 hrs |
| 1.2 | Redesign `PurchaseOrderList` — match other list views (summary cards, desktop table, compact mobile rows, search, CSV export) | `PurchaseOrderList.tsx` | 3-4 hrs |
| 1.3 | Add skeleton loaders for all list views | All list components | 2 hrs |
| 1.4 | Consistent empty states across all views | `PurchaseOrderList.tsx` (others already done) | 1 hr |
| 1.5 | Add confirmation modal component for destructive actions (delete with "affects X records" warning) | New `ConfirmModal.tsx` + all delete handlers | 2 hrs |

### Phase 2: Data Integrity — "Stop breaking things"
**Impact: HIGH | Effort: MEDIUM**

| # | Task | Files | Effort |
|---|------|-------|--------|
| 2.1 | Cascade deletion checks — warn before deleting customers/products with linked records | Service layer + delete handlers | 3 hrs |
| 2.2 | Soft-delete with archive (mark as `archived` instead of hard-delete) | DB schema + services + list filters | 4 hrs |
| 2.3 | Form validation on all forms (required fields, number ranges, email format) | `ProductForm`, `CustomerForm`, `SupplierForm`, `SalesForm`, `ExpenseForm`, `PurchaseOrderForm` | 4 hrs |
| 2.4 | Proper error handling with retry — catch network failures, show inline errors, preserve form state | All form components | 3 hrs |
| 2.5 | Undo support for delete operations (5-second undo toast) | New utility + all delete flows | 3 hrs |

### Phase 3: Navigation & Architecture — "Make it a proper SPA"
**Impact: MEDIUM-HIGH | Effort: MEDIUM**

| # | Task | Files | Effort |
|---|------|-------|--------|
| 3.1 | React Router integration — URL-based navigation, back button support | `App.tsx` → route-based views | 4 hrs |
| 3.2 | Code splitting with `React.lazy()` + `Suspense` — reduce initial bundle | `App.tsx` + all page imports | 2 hrs |
| 3.3 | Fix all 21 `any` types — proper interfaces everywhere | Multiple files | 3 hrs |
| 3.4 | Shared product context (prevent duplicate fetches in SalesForm + ProductList) | New context or Zustand store | 2 hrs |
| 3.5 | Extract App.tsx handlers into per-view container components | New container components | 3 hrs |

### Phase 4: Business Intelligence — "Help the owner make decisions"
**Impact: HIGH | Effort: HIGH**

| # | Task | Description | Effort |
|---|------|-------------|--------|
| 4.1 | Dashboard trend charts | Sales/expenses line chart (7-day, 30-day, 90-day). Use Recharts or Chart.js | 4 hrs |
| 4.2 | Top-selling products widget | Ranked list by revenue and quantity in Dashboard | 2 hrs |
| 4.3 | Customer purchase history | View all sales for a customer from their profile | 3 hrs |
| 4.4 | Inventory turnover metrics | Days-of-stock, reorder point suggestions | 3 hrs |
| 4.5 | Sales vs Expense comparison | Monthly comparison view in P&L | 2 hrs |
| 4.6 | Payment tracking on sales | Track paid/unpaid/partial — accounts receivable view | 4 hrs |

### Phase 5: Scale & Reliability — "Handle real-world usage"
**Impact: MEDIUM | Effort: HIGH**

| # | Task | Description | Effort |
|---|------|-------------|--------|
| 5.1 | Pagination on all lists | Server-side pagination with page controls | 4 hrs |
| 5.2 | Virtual scrolling for large lists | Use `react-window` or `tanstack-virtual` | 3 hrs |
| 5.3 | Optimistic updates | Instant UI updates, rollback on failure | 4 hrs |
| 5.4 | Offline data caching | Cache recent data in IndexedDB for offline read | 6 hrs |
| 5.5 | Image lazy loading + optimization | Lazy load product images, compress on upload | 2 hrs |
| 5.6 | Unit + integration tests | Service layer tests, component tests for forms | 8 hrs |
| 5.7 | E2E tests | Critical flows: create sale, delete product, P&L accuracy | 6 hrs |

### Phase 6: Nice-to-Have — "Someday/Maybe"
**Impact: LOW | Effort: VARIES**

| # | Task | Effort |
|---|------|--------|
| 6.1 | Dark mode | 2 hrs |
| 6.2 | Multi-currency support | 4 hrs |
| 6.3 | Barcode/QR scanning for products | 6 hrs |
| 6.4 | PDF invoice generation from sales | 4 hrs |
| 6.5 | Multi-user / role-based access | 8 hrs |
| 6.6 | Notification system (low stock alerts, payment reminders) | 6 hrs |
| 6.7 | Data backup / export (full database export) | 3 hrs |

---

## Completed Work Log

### Phase 0: Foundation (Complete ✅)
- Consolidated types into `types.ts`
- Fixed service layer (salesService, inventoryService)
- Added dashboardService, plService, imageService
- Created custom hooks (useProducts, useCustomers, useSuppliers, useSales, useExpenses)
- Added ErrorBoundary component
- PWA configuration (manifest, service worker, icons)
- CSS foundation with Tailwind + safe-area insets
- Installed React Router v7 (not yet integrated)

### UI/UX Improvements (Complete ✅)
- ExpenseForm — proper TypeScript, controlled inputs, validation
- ExpenseList — search, filters, category filter, CSV export, compact mobile rows
- SalesList — search, status filter, date range, CSV export, status badges
- SalesForm — product picker with variant support, mobile-optimized
- ProfitLoss — real-time P&L, date range filter, expense breakdown
- Dashboard — summary cards, quick actions, low-stock alerts (sorted, top-5 with "View All")
- ProductList — compact mobile cards with variant display
- SupplierList — compact mobile list rows with tappable contact icons
- CustomerList — compact mobile list rows with tappable contact icons
- Extracted UI components: PageHeader, PrimaryButton, FloatingActionButton, NavButton, ProductPicker

### Documentation (Complete ✅)
- `docs/APP_OVERVIEW.md` — feature summary
- `docs/ARCHITECTURE.md` — technical architecture
- `docs/ROADMAP.md` — this file

---

## Priority Matrix

```
                    HIGH IMPACT
                        │
     Phase 1 (Polish)   │   Phase 4 (BI)
     Phase 2 (Integrity)│
                        │
  LOW EFFORT ───────────┼─────────── HIGH EFFORT
                        │
     Phase 3 (Nav)      │   Phase 5 (Scale)
                        │   Phase 6 (Nice-to-have)
                        │
                    LOW IMPACT
```

**Recommended execution order:** 1 → 2 → 4.1-4.2 → 3 → 4.3-4.6 → 5 → 6

---

*This roadmap is a living document. Update it as items are completed or priorities change.*