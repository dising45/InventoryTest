# Improvement Roadmap

## ✅ Completed Improvements

### Phase 1: Type Safety
- Consolidated all types into `types.ts` with proper exports
- Added `SalesItem` type, `ViewState` union, `DashboardStats` interface
- Added `vite-env.d.ts` for Vite type declarations

### Phase 2: Service Layer
- Fixed `salesService.supabase.ts` — object-literal service pattern with proper `this` binding
- Fixed `inventoryService.local.ts` — aligned API with supabase variant
- Added `dashboardService.supabase.ts` for dashboard aggregation queries
- Added `plService.supabase.ts` for profit & loss calculations
- Added `imageService.supabase.ts` for product image uploads
- Created `.env.example` with all required environment variables

### Phase 3: UI/UX Polish
- Created `src/index.css` with Tailwind directives + custom scrollbar styles + safe-area insets
- Updated `index.html` with proper PWA meta tags, theme-color, apple-touch-icon
- Updated `vite.config.ts` with PWA plugin, path aliases, build optimizations

### Phase 4: Component Improvements
- `ExpenseForm.tsx` — proper TypeScript, controlled inputs, validation
- `ExpenseList.tsx` — search, date range filter, category filter, CSV export
- `SalesList.tsx` — search, status filter, date range, CSV export, status badge
- `ProfitLoss.tsx` — real-time P&L from `plService`, date range filter, expense breakdown
- Created `utils/exportCSV.ts` utility for CSV export

### Phase 5: Architecture Foundation (NEW)
- **Custom Hooks**: Created `hooks/useProducts.ts`, `hooks/useCustomers.ts`, `hooks/useSuppliers.ts`, `hooks/useSales.ts`, `hooks/useExpenses.ts` — encapsulate all CRUD + loading state
- **ErrorBoundary**: Created `components/ErrorBoundary.tsx` — graceful error handling with retry
- **React Router**: Installed `react-router-dom` v7 (ready for route-based navigation)

### Documentation
- `docs/APP_OVERVIEW.md` — feature summary and tech stack
- `docs/ARCHITECTURE.md` — detailed architecture documentation
- `docs/ROADMAP.md` — this file

---

## 🔲 Remaining Improvements (Prioritized)

### Phase 6: App.tsx Refactor (High Impact)
The current `App.tsx` is 636 lines with all state, handlers, and navigation in one component.

**Steps:**
1. Gradually migrate each view to use custom hooks instead of prop-drilling
2. Extract `MobileBottomNav` and `NavButton` to separate files (already partially done)
3. Extract `PageHeader` and `PrimaryButton` to `components/ui/` directory
4. Consider React Router for URL-based navigation (foundation installed)

### Phase 7: Code Splitting (Medium Impact)
- Bundle is 527KB — above the 500KB warning threshold
- Add `React.lazy()` + `Suspense` for route-level code splitting
- Move heavy components (SalesForm, PurchaseOrderForm) to lazy-loaded chunks

### Phase 8: Form Validation (Medium Impact)
- Add proper form validation to `ProductForm`, `CustomerForm`, `SupplierForm`
- Consider a form library like `react-hook-form` for complex forms (SalesForm)
- Add toast notifications instead of `alert()` calls

### Phase 9: State Management (Lower Priority)
- Current: each hook manages its own fetch cycle independently
- Consider React Context or Zustand for shared state (products used in SalesForm, etc.)
- Add optimistic updates for better perceived performance

### Phase 10: Testing (Lower Priority)
- Add unit tests for service layer
- Add component tests for forms and lists
- Add E2E tests for critical flows (create sale, delete product)

### Phase 11: Performance (Lower Priority)
- Add `useMemo`/`useCallback` where profiling shows re-render issues
- Add virtual scrolling for large lists (products, sales)
- Add image optimization and lazy loading for product images
- Implement pagination for large datasets