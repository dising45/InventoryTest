# InventoryPro — App Overview

## What Is It?

**InventoryPro** is a mobile-first Progressive Web App (PWA) for small retail businesses to manage their inventory, sales, customers, suppliers, expenses, and profitability — all from a single dashboard.

## Target Users

- Small retail shop owners
- Warehouse managers
- Sole proprietors managing stock and sales

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | KPI cards (sales today, MTD revenue, profit margin, inventory value, low stock alerts) with Recharts visualizations |
| **Inventory** | Product CRUD with variant support (sizes, colors). Each variant tracks its own SKU, stock, and price modifier. Image upload via Supabase Storage |
| **Sales** | Create sales orders against customers. Auto-deducts stock (supports variant-level stock). Supports discount (flat/%), tax (flat/%), and status tracking |
| **Customers** | Customer directory with name, email, phone, address |
| **Suppliers** | Supplier directory with contact person, email, phone, address |
| **Expenses** | Track business expenses by category, date, vendor, payment mode |
| **Profit & Loss** | Monthly P&L report aggregating sales revenue, COGS, and expenses |
| **Purchase Orders** | _(Types defined, UI partially built but not wired into main nav)_ |
| **PWA** | Installable on mobile, works offline (service worker via vite-plugin-pwa) |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 19.2 |
| **Language** | TypeScript | 5.8 |
| **Build Tool** | Vite | 6.x |
| **Styling** | Tailwind CSS (v4 via `@tailwindcss/vite`) | 4.2 |
| **Backend/DB** | Supabase (PostgreSQL + Auth + Storage) | JS SDK 2.95 |
| **Charts** | Recharts | 3.7 |
| **Icons** | Lucide React | 0.563 |
| **Image Compression** | CompressorJS | 1.2 |
| **PWA** | vite-plugin-pwa | 1.2 |

## Database Tables

| Table | Purpose |
|-------|---------|
| `products` | Product catalog (name, cost_price, sell_price, stock, has_variants) |
| `variants` | Product variants (name, sku, stock, price_modifier) |
| `customers` | Customer records |
| `suppliers` | Supplier records |
| `sales_orders` | Sales order headers (customer, totals, discount, tax, status) |
| `sales_items` | Sales line items (product, variant, quantity, unit_price, cost_price snapshot) |
| `expenses` | Business expenses (category, amount, date, vendor) |

> **Note:** The `supabase_schema.sql` file currently only defines `products` and `variants`. The remaining tables (customers, suppliers, sales_orders, sales_items, expenses) exist in the Supabase project but are not captured in the schema file yet. This is tracked in Phase 2 of the roadmap.

## Project Structure

```
InventoryTest/
├── index.html          # HTML entry point
├── index.tsx           # React entry + PWA registration
├── App.tsx             # Main app component (all state + view routing)
├── types.ts            # TypeScript interfaces
├── vite.config.ts      # Vite + Tailwind + PWA config
├── .env                # Supabase credentials (git-ignored)
├── .env.example        # Credential template
├── supabase_schema.sql # Partial DB schema
├── components/
│   ├── Dashboard.tsx
│   ├── ProductList.tsx / ProductForm.tsx
│   ├── SalesList.tsx / SalesForm.tsx
│   ├── CustomerList.tsx / CustomerForm.tsx
│   ├── SupplierList.tsx / SupplierForm.tsx
│   ├── ExpenseList.tsx / ExpenseForm.tsx
│   ├── ProfitLoss.tsx
│   ├── PurchaseOrderList.tsx / PurchaseOrderForm.tsx / PurchaseItemRow.tsx
│   ├── MobileBottomNav.tsx
│   └── inventory/
│       ├── InventoryCard.tsx
│       └── VariantSheet.tsx
├── services/
│   ├── supabaseClient.ts          # Supabase client init
│   ├── inventoryService.supabase.ts / .local.ts
│   ├── customerService.supabase.ts / .local.ts
│   ├── supplierService.supabase.ts / .local.ts
│   ├── salesService.supabase.ts
│   ├── expenseService.supabase.ts
│   ├── purchaseService.supabase.ts
│   ├── dashboardService.supabase.ts
│   ├── plService.supabase.ts
│   └── imageService.supabase.ts
├── public/
│   ├── favicon.ico
│   ├── pwa-192.png
│   └── pwa-512.png
└── src/
    └── index.css       # Tailwind CSS entry