# InventoryPro — Architecture Document

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser (PWA)                  │
│                                                   │
│  index.html → index.tsx → App.tsx                │
│       │                      │                    │
│       │              ┌───────┴────────┐          │
│       │              │  View Routing   │          │
│       │              │  (useState)     │          │
│       │              └───────┬────────┘          │
│       │                      │                    │
│  ┌────┴──────────────────────┴──────────────┐    │
│  │              Components                    │    │
│  │  Dashboard │ ProductList │ SalesList │ ... │    │
│  └──────────────────┬────────────────────────┘    │
│                      │                            │
│  ┌──────────────────┴────────────────────────┐    │
│  │           Service Layer                    │    │
│  │  inventoryService │ salesService │ ...     │    │
│  └──────────────────┬────────────────────────┘    │
│                      │                            │
└──────────────────────┼────────────────────────────┘
                       │ HTTPS
┌──────────────────────┼────────────────────────────┐
│              Supabase Cloud                        │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ PostgreSQL │  │ Storage  │  │ Auth (future)│   │
│  │ (Tables)   │  │ (Images) │  │              │   │
│  └───────────┘  └──────────┘  └──────────────┘   │
└────────────────────────────────────────────────────┘
```

## Data Flow

### Read Flow
```
User navigates to "Sales" tab
  → App.tsx renders <SalesList>
  → SalesList receives `sales` prop (loaded at app init)
  → Data was fetched via salesService.getSales()
  → Which calls supabase.from('sales_orders').select(...)
```

### Write Flow
```
User submits SalesForm
  → handleSaveSale() in App.tsx
  → salesService.createSale(data)
    → INSERT into sales_orders
    → INSERT into sales_items (with cost_price snapshot)
    → UPDATE products stock (deduct)
    → UPDATE variants stock (if variant sale)
  → loadSales() + loadProducts() to refresh state
  → setCurrentView('sales') to navigate back
```

## Component Architecture

### Current Pattern: Monolithic App.tsx

```
App.tsx (≈400 lines)
├── All useState declarations (products, customers, suppliers, sales, expenses)
├── All CRUD handlers (handleSave*, handleDelete*)
├── View routing via currentView string matching
├── Inline component rendering with conditional blocks
│
├── <Dashboard />         — KPI cards + charts
├── <ProductList />       — Grid of product cards
├── <ProductForm />       — Add/edit product form
├── <SalesList />         — Sales order table
├── <SalesForm />         — Multi-item sales form
├── <CustomerList />      — Customer table
├── <CustomerForm />      — Customer form
├── <SupplierList />      — Supplier table
├── <SupplierForm />      — Supplier form
├── <ExpenseList />       — Expense table
├── <ExpenseForm />       — Expense form
├── <ProfitLoss />        — P&L report (self-contained, fetches own data)
├── <MobileBottomNav />   — Bottom tab bar (mobile only)
└── <NavButton />         — Sidebar nav item (desktop only)
```

## Service Layer

Each domain has a dedicated service file:

| Service | File | Methods |
|---------|------|---------|
| Inventory | `inventoryService.supabase.ts` | getProducts, addProduct, updateProduct, deleteProduct |
| Customers | `customerService.supabase.ts` | getCustomers, addCustomer, updateCustomer, deleteCustomer |
| Suppliers | `supplierService.supabase.ts` | getSuppliers, addSupplier, updateSupplier, deleteSupplier |
| Sales | `salesService.supabase.ts` | getSales, createSale, updateSale, deleteSale, updateStatus |
| Expenses | `expenseService.supabase.ts` | getExpenses, addExpense, deleteExpense |
| Dashboard | `dashboardService.supabase.ts` | getKPIs |
| P&L | `plService.supabase.ts` | (monthly aggregations) |
| Purchases | `purchaseService.supabase.ts` | (purchase order CRUD) |
| Images | `imageService.supabase.ts` | (Supabase Storage uploads) |

### Local vs Supabase Services

Some domains have `.local.ts` variants that use `localStorage` instead of Supabase:
- `inventoryService.local.ts`
- `customerService.local.ts`
- `supplierService.local.ts`

These can be swapped in for offline-first or demo modes. Currently the app imports the `.supabase.ts` versions.

## State Management

**Current:** All state lives in `App.tsx` via `useState` hooks.

```typescript
const [products, setProducts] = useState<Product[]>([])
const [customers, setCustomers] = useState<Customer[]>([])
const [suppliers, setSuppliers] = useState<Supplier[]>([])
const [sales, setSales] = useState<SalesOrder[]>([])
const [expenses, setExpenses] = useState<Expense[]>([])
```

**Loading:** A single `isLoading` boolean gates the entire UI.

**Refresh pattern:** After any mutation, the relevant `load*()` function is called to re-fetch from Supabase.

## View Routing

**Current:** Manual string-based routing via `ViewState` type:

```typescript
type ViewState =
  | 'dashboard'
  | 'inventory' | 'add-product' | 'edit-product'
  | 'customers' | 'add-customer' | 'edit-customer'
  | 'suppliers' | 'add-supplier' | 'edit-supplier'
  | 'sales' | 'add-sale' | 'edit-sale'
  | 'expenses' | 'add-expense'
  | 'purchase-orders' | 'add-po'
  | 'pl'
```

No URL-based routing — no deep links, no browser back/forward support.

## Database Schema

### Defined in `supabase_schema.sql`
- `products` (id, name, description, buy_price, sell_price, stock, has_variants)
- `variants` (id, product_id FK, name, sku, stock, price_modifier)

### Exist in Supabase but NOT in schema file
- `customers` (id, name, email, phone, address, created_at)
- `suppliers` (id, name, contact_person, email, phone, address, created_at)
- `sales_orders` (id, customer_id FK, subtotal, discount, discount_type, tax, tax_type, total_amount, order_date, status, created_at)
- `sales_items` (id, sales_order_id FK, product_id FK, variant_id FK, quantity, unit_price, cost_price, line_total)
- `expenses` (id, expense_date, category, description, amount, payment_mode, reference, vendor, created_at)

### Known Schema Inconsistency
The SQL file uses `buy_price` but the TypeScript types and all service files use `cost_price`. The actual Supabase tables likely use `cost_price`.

## Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- CSS entry: `src/index.css` with `@import "tailwindcss"`
- Google Fonts: Inter (300–700)
- Responsive: Mobile-first with `md:` breakpoints
- Mobile: Bottom tab navigation + floating action buttons
- Desktop: Left sidebar navigation

## PWA Configuration

- **vite-plugin-pwa** with `generateSW` strategy
- Auto-update on new builds
- Manifest: standalone, portrait, indigo theme
- Icons: 192×192 and 512×512 PNG