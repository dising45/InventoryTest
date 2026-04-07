// App.tsx — Refactored with extracted UI components and custom hooks
import { useState } from 'react'
import type { ViewState, SalesItem } from './types'

// Custom hooks
import { useProducts } from './hooks/useProducts'
import { useCustomers } from './hooks/useCustomers'
import { useSuppliers } from './hooks/useSuppliers'
import { useSales } from './hooks/useSales'
import { useExpenses } from './hooks/useExpenses'

// Services (only needed for salesService.updateStatus)
import { salesService } from './services/salesService.supabase'

// Extracted UI components
import { PageHeader, PrimaryButton, FloatingActionButton, NavButton } from './components/ui'
import { ErrorBoundary } from './components/ErrorBoundary'
import MobileBottomNav from './components/MobileBottomNav'

// Page components
import Dashboard from './components/Dashboard'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import CustomerList from './components/CustomerList'
import CustomerForm from './components/CustomerForm'
import SupplierList from './components/SupplierList'
import SupplierForm from './components/SupplierForm'
import SalesList from './components/SalesList'
import SalesForm from './components/SalesForm'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'
import ProfitLoss from './components/ProfitLoss'

import {
  LayoutDashboard,
  Package,
  Plus,
  Box,
  Users,
  Truck,
  ShoppingCart,
  BarChart3,
  Wallet,
  Loader2,
} from 'lucide-react'

/* =======================
   MAIN APP COMPONENT
======================= */
export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')

  // Data hooks
  const { products, loading: productsLoading, reload: reloadProducts, saveProduct, deleteProduct: removeProduct } = useProducts()
  const { customers, loading: customersLoading, reload: reloadCustomers, saveCustomer, deleteCustomer: removeCustomer } = useCustomers()
  const { suppliers, loading: suppliersLoading, reload: reloadSuppliers, saveSupplier, deleteSupplier: removeSupplier } = useSuppliers()
  const { sales, loading: salesLoading, reload: reloadSales, saveSale, deleteSale: removeSale } = useSales()
  const { expenses, loading: expensesLoading, reload: reloadExpenses, saveExpense, deleteExpense: removeExpense } = useExpenses()

  // Editing state
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | undefined>()
  const [editingSale, setEditingSale] = useState<typeof sales[0] | undefined>()
  const [editingCustomer, setEditingCustomer] = useState<typeof customers[0] | undefined>()
  const [editingSupplier, setEditingSupplier] = useState<typeof suppliers[0] | undefined>()
  const [editingExpense, setEditingExpense] = useState<typeof expenses[0] | undefined>()

  const isLoading = productsLoading || customersLoading || suppliersLoading || salesLoading || expensesLoading

  /* -------------------- HANDLERS -------------------- */
  const handleSaveProduct = async (data: any) => {
    try {
      await saveProduct(editingProduct ? { ...data, id: editingProduct.id } : data)
      setEditingProduct(undefined)
      setCurrentView('inventory')
    } catch {
      alert('Failed to save product.')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await removeProduct(id)
    } catch {
      alert('Failed to delete product.')
    }
  }

  const handleSaveSale = async (data: { customer_id: string; items: SalesItem[]; total_amount: number; order_date: string }) => {
    try {
      await saveSale(data, editingSale?.id)
      await reloadProducts() // stock changed
      setEditingSale(undefined)
      setCurrentView('sales')
    } catch {
      alert('Unable to save sale.')
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Delete this sale? Stock will be restored.')) return
    try {
      await removeSale(id)
      await reloadProducts() // stock restored
    } catch (err) {
      console.error('DELETE ERROR:', err)
      alert('Failed to delete sale. Check Console for details.')
    }
  }

  const handleSaveExpense = async (data: any) => {
    try {
      await saveExpense(data, editingExpense?.id)
      setEditingExpense(undefined)
      setCurrentView('expenses')
    } catch {
      alert('Failed to save expense.')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete expense?')) return
    try {
      await removeExpense(id)
    } catch {
      alert('Failed to delete expense.')
    }
  }

  /* -------------------- VIEW HELPERS -------------------- */
  const hideMobileNav = [
    'add-product', 'edit-product',
    'add-sale', 'edit-sale',
    'add-expense', 'edit-expense',
    'add-customer', 'edit-customer',
    'add-supplier', 'edit-supplier'
  ].includes(currentView)

  const viewTitles: Record<string, string> = {
    dashboard: 'Overview',
    inventory: 'Inventory',
    sales: 'Sales Orders',
    customers: 'Customers',
    suppliers: 'Suppliers',
    expenses: 'Expenses',
    pl: 'Reports'
  }

  /* -------------------- RENDER -------------------- */
  return (
    <div className="h-[100dvh] w-full bg-gray-50 flex overflow-hidden font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 h-full shrink-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Box className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">InventoryPro</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavButton view="dashboard" icon={LayoutDashboard} label="Dashboard" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="inventory" icon={Package} label="Inventory" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="sales" icon={ShoppingCart} label="Sales" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="customers" icon={Users} label="Customers" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="suppliers" icon={Truck} label="Suppliers" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="expenses" icon={Wallet} label="Expenses" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="pl" icon={BarChart3} label="Profit & Loss" currentView={currentView} setCurrentView={setCurrentView} />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Admin</p>
              <p className="text-[10px] text-gray-500 truncate font-medium">admin@inventory.pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-gray-50">
        
        {/* MOBILE TOP HEADER */}
        {!hideMobileNav && (
          <header className="md:hidden flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shrink-0 z-20 sticky top-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-200">
                <Box className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-gray-900 tracking-tight">
                {viewTitles[currentView] || 'App'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm">
              JD
            </div>
          </header>
        )}

        {/* SCROLLABLE VIEWPORT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-gray-400 animate-pulse">Loading workspace...</p>
              </div>
            ) : (
              <ErrorBoundary>
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  {/* DASHBOARD */}
                  {currentView === 'dashboard' && (
                    <Dashboard products={products} />
                  )}

                  {/* INVENTORY */}
                  {currentView === 'inventory' && (
                    <>
                      <PageHeader
                        title="Inventory"
                        action={
                          <PrimaryButton onClick={() => { setEditingProduct(undefined); setCurrentView('add-product'); }}>
                            <Plus className="w-4 h-4 mr-2" /> Add Product
                          </PrimaryButton>
                        }
                      />
                      <FloatingActionButton onClick={() => { setEditingProduct(undefined); setCurrentView('add-product'); }} />
                      <ProductList
                        products={products}
                        onEdit={p => { setEditingProduct(p); setCurrentView('edit-product'); }}
                        onDelete={handleDeleteProduct}
                      />
                    </>
                  )}

                  {(currentView === 'add-product' || currentView === 'edit-product') && (
                    <div className="max-w-3xl mx-auto">
                      <ProductForm
                        initialData={editingProduct}
                        onSave={handleSaveProduct}
                        onCancel={() => setCurrentView('inventory')}
                      />
                    </div>
                  )}

                  {/* SALES */}
                  {currentView === 'sales' && (
                    <>
                      <PageHeader
                        title="Sales Orders"
                        action={
                          <PrimaryButton onClick={() => { setEditingSale(undefined); setCurrentView('add-sale'); }}>
                            <Plus className="w-4 h-4 mr-2" /> New Sale
                          </PrimaryButton>
                        }
                      />
                      <FloatingActionButton onClick={() => { setEditingSale(undefined); setCurrentView('add-sale'); }} />
                      <SalesList
                        sales={sales}
                        onEdit={s => { setEditingSale(s); setCurrentView('edit-sale'); }}
                        onDelete={handleDeleteSale}
                        onAddSale={() => { setEditingSale(undefined); setCurrentView('add-sale'); }}
                        onStatusChange={async (id, status) => {
                           await salesService.updateStatus(id, status)
                           await reloadSales()
                        }}
                      />
                    </>
                  )}

                  {(currentView === 'add-sale' || currentView === 'edit-sale') && (
                    <div className="max-w-4xl mx-auto">
                      <SalesForm
                        customers={customers}
                        products={products}
                        initialData={editingSale}
                        onSave={handleSaveSale}
                        onCancel={() => { setEditingSale(undefined); setCurrentView('sales'); }}
                      />
                    </div>
                  )}

                  {/* CUSTOMERS */}
                  {currentView === 'customers' && (
                    <>
                      <PageHeader
                        title="Customers"
                        action={
                          <PrimaryButton onClick={() => setCurrentView('add-customer')}>
                            <Plus className="w-4 h-4 mr-2" /> Add Customer
                          </PrimaryButton>
                        }
                      />
                      <FloatingActionButton onClick={() => setCurrentView('add-customer')} />
                      <CustomerList
                        customers={customers}
                        onEdit={(c) => { setEditingCustomer(c); setCurrentView('edit-customer'); }}
                        onDelete={async (id) => { await removeCustomer(id); }}
                      />
                    </>
                  )}

                  {(currentView === 'add-customer' || currentView === 'edit-customer') && (
                    <div className="max-w-2xl mx-auto">
                      <CustomerForm
                        initialData={editingCustomer}
                        onSave={async (data) => {
                          await saveCustomer(data, editingCustomer?.id)
                          setEditingCustomer(undefined)
                          setCurrentView('customers')
                        }}
                        onCancel={() => { setEditingCustomer(undefined); setCurrentView('customers'); }}
                      />
                    </div>
                  )}

                  {/* SUPPLIERS */}
                  {currentView === 'suppliers' && (
                    <>
                      <PageHeader
                        title="Suppliers"
                        action={
                          <PrimaryButton onClick={() => setCurrentView('add-supplier')}>
                            <Plus className="w-4 h-4 mr-2" /> Add Supplier
                          </PrimaryButton>
                        }
                      />
                      <FloatingActionButton onClick={() => setCurrentView('add-supplier')} />
                      <SupplierList
                        suppliers={suppliers}
                        onEdit={(s) => { setEditingSupplier(s); setCurrentView('edit-supplier'); }}
                        onDelete={async (id) => { await removeSupplier(id); }}
                      />
                    </>
                  )}

                  {(currentView === 'add-supplier' || currentView === 'edit-supplier') && (
                    <div className="max-w-2xl mx-auto">
                      <SupplierForm
                        initialData={editingSupplier}
                        onSave={async (data) => {
                          await saveSupplier(data, editingSupplier?.id)
                          setEditingSupplier(undefined)
                          setCurrentView('suppliers')
                        }}
                        onCancel={() => { setEditingSupplier(undefined); setCurrentView('suppliers'); }}
                      />
                    </div>
                  )}

                  {/* EXPENSES */}
                  {currentView === 'expenses' && (
                    <>
                      <PageHeader
                        title="Expenses"
                        action={
                          <PrimaryButton onClick={() => setCurrentView('add-expense')}>
                            <Plus className="w-4 h-4 mr-2" /> Add Expense
                          </PrimaryButton>
                        }
                      />
                      <FloatingActionButton onClick={() => setCurrentView('add-expense')} />
                      <ExpenseList
                        expenses={expenses}
                        onEdit={(exp) => { setEditingExpense(exp); setCurrentView('edit-expense'); }}
                        onDelete={handleDeleteExpense}
                      />
                    </>
                  )}

                  {(currentView === 'add-expense' || currentView === 'edit-expense') && (
                    <div className="max-w-2xl mx-auto">
                      <ExpenseForm
                        initialData={editingExpense}
                        onSave={handleSaveExpense}
                        onCancel={() => { setEditingExpense(undefined); setCurrentView('expenses'); }}
                      />
                    </div>
                  )}

                  {/* P&L */}
                  {currentView === 'pl' && (
                    <>
                      <PageHeader title="Profit & Loss" />
                      <ProfitLoss />
                    </>
                  )}
                </div>
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        {!hideMobileNav && (
          <div className="shrink-0">
            <MobileBottomNav
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </div>
        )}
      </main>
    </div>
  )
}