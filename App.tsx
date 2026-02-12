// App.tsx
import React, { useState, useEffect } from 'react'
import {
  ViewState,
  Product,
  Customer,
  Supplier,
  SalesOrder,
  SalesItem,
  Expense,
} from './types'

import { inventoryService } from './services/inventoryService.supabase'
import { customerService } from './services/customerService.supabase'
import { supplierService } from './services/supplierService.supabase'
import { salesService } from './services/salesService.supabase'
import { expenseService } from './services/expenseService.supabase'

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
  Menu // Kept for future use if needed
} from 'lucide-react'

/* =======================
   UI COMPONENTS
======================= */

const PrimaryButton = ({ onClick, children, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`group relative inline-flex items-center justify-center px-4 py-2 
    text-sm font-bold text-white transition-all duration-200 
    bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 
    hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-indigo-600 ${className}`}
  >
    {children}
  </button>
)

const PageHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-2 sm:static sm:bg-transparent">
    <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
    {action && <div className="hidden sm:block">{action}</div>}
  </div>
)

/* =======================
   MOBILE BOTTOM NAV
======================= */
const MobileBottomNav = ({
  currentView,
  setCurrentView,
}: {
  currentView: ViewState
  setCurrentView: (v: ViewState) => void
}) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'sales', icon: ShoppingCart, label: 'Sales' },
    { id: 'expenses', icon: Wallet, label: 'Exp' },
    { id: 'pl', icon: BarChart3, label: 'P&L' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 pb-safe md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-1">
        {items.map(({ id, icon: Icon, label }) => {
          const isActive = currentView === id
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id as ViewState)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 active:scale-90 ${isActive ? 'text-indigo-600' : 'text-gray-400'
                }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full shadow-[0_2px_8px_rgba(79,70,229,0.3)]" />
              )}
              <Icon className={`w-6 h-6 mb-1 transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* =======================
   DESKTOP NAV BUTTON
======================= */
const NavButton = ({
  view,
  icon: Icon,
  label,
  currentView,
  setCurrentView,
}: {
  view: ViewState
  icon: any
  label: string
  currentView: ViewState
  setCurrentView: (v: ViewState) => void
}) => {
  const isActive = currentView === view
  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group
      ${isActive
          ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
        }`}
    >
      <Icon
        className={`w-5 h-5 mr-3.5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span className="text-sm">{label}</span>
      {isActive && (
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-sm" />
      )}
    </button>
  )
}

/* =======================
   MAIN APP COMPONENT
======================= */
export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [sales, setSales] = useState<SalesOrder[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Editing State
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [editingSale, setEditingSale] = useState<SalesOrder | undefined>()
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>()

  const [isLoading, setIsLoading] = useState(true)

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadProducts(),
        loadCustomers(),
        loadSuppliers(),
        loadSales(),
        loadExpenses(),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async () => setProducts(await inventoryService.getProducts())
  const loadCustomers = async () => setCustomers(await customerService.getCustomers())
  const loadSuppliers = async () => setSuppliers(await supplierService.getSuppliers())
  const loadSales = async () => setSales(await salesService.getSales())
  const loadExpenses = async () => setExpenses(await expenseService.getExpenses())

  /* -------------------- HANDLERS -------------------- */
  const handleSaveProduct = async (data: any) => {
    try {
      if (editingProduct) {
        await inventoryService.updateProduct({ ...data, id: editingProduct.id })
      } else {
        await inventoryService.addProduct(data)
      }
      await loadProducts()
      setEditingProduct(undefined)
      setCurrentView('inventory')
    } catch {
      alert('Failed to save product.')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await inventoryService.deleteProduct(id)
      await loadProducts()
    } catch {
      alert('Failed to delete product.')
    }
  }

  const handleSaveSale = async (data: { customer_id: string; items: SalesItem[]; total_amount: number; order_date: string }) => {
    try {
      if (editingSale) {
        await salesService.updateSale(editingSale.id, data)
        setEditingSale(undefined)
      } else {
        await salesService.createSale(data)
      }
      await Promise.all([loadSales(), loadProducts()])
      setCurrentView('sales')
    } catch (e) {
      alert('Unable to save sale.')
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Delete this sale? Stock will be restored.')) return
    try {
      await salesService.deleteSale(id)
      await Promise.all([loadSales(), loadProducts()])
      
    } catch {
      console.error('DELETE ERROR:', err)
      alert('Failed to delete sale.Check Console for details.')

    }
  }

  const handleSaveExpense = async (data: any) => {
    try {
      await expenseService.addExpense(data)
      await loadExpenses()
      setCurrentView('expenses')
    } catch {
      alert('Failed to save expense.')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete expense?')) return
    try {
      await expenseService.deleteExpense(id)
      await loadExpenses()
    } catch {
      alert('Failed to delete expense.')
    }
  }

  /* -------------------- VIEW HELPERS -------------------- */
  const hideMobileNav = [
    'add-product', 'edit-product',
    'add-sale', 'edit-sale',
    'add-expense',
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
    // h-[100dvh] ensures it fits exactly on mobile screens without address bar jank
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
                    {/* Mobile Floating Action Button */}
                    <button 
                      onClick={() => { setEditingProduct(undefined); setCurrentView('add-product'); }}
                      className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
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
                    <button 
                      onClick={() => { setEditingSale(undefined); setCurrentView('add-sale'); }}
                      className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                    <SalesList
                      sales={sales}
                      onEdit={s => { setEditingSale(s); setCurrentView('edit-sale'); }}
                      onDelete={handleDeleteSale}
                      onAddSale={() => { setEditingSale(undefined); setCurrentView('add-sale'); }}
                      onStatusChange={async (id, status) => {
                         await salesService.updateStatus(id, status)
                         await loadSales()
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
                    <button onClick={() => setCurrentView('add-customer')} className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"><Plus className="w-6 h-6" /></button>
                    <CustomerList
                      customers={customers}
                      onEdit={(c) => { setEditingCustomer(c); setCurrentView('edit-customer'); }}
                      onDelete={async (id) => { await customerService.deleteCustomer(id); await loadCustomers(); }}
                    />
                  </>
                )}

                {(currentView === 'add-customer' || currentView === 'edit-customer') && (
                  <div className="max-w-2xl mx-auto">
                    <CustomerForm
                      initialData={editingCustomer}
                      onSave={async (data) => {
                        if (editingCustomer) {
                          await customerService.updateCustomer(editingCustomer.id, data)
                        } else {
                          await customerService.addCustomer(data)
                        }
                        await loadCustomers()
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
                    <button onClick={() => setCurrentView('add-supplier')} className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"><Plus className="w-6 h-6" /></button>
                    <SupplierList
                      suppliers={suppliers}
                      onEdit={(s) => { setEditingSupplier(s); setCurrentView('edit-supplier'); }}
                      onDelete={async (id) => { await supplierService.deleteSupplier(id); await loadSuppliers(); }}
                    />
                  </>
                )}

                {(currentView === 'add-supplier' || currentView === 'edit-supplier') && (
                  <div className="max-w-2xl mx-auto">
                    <SupplierForm
                      initialData={editingSupplier}
                      onSave={async (data) => {
                        if (editingSupplier) {
                          await supplierService.updateSupplier(editingSupplier.id, data)
                        } else {
                          await supplierService.addSupplier(data)
                        }
                        await loadSuppliers()
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
                    <button onClick={() => setCurrentView('add-expense')} className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"><Plus className="w-6 h-6" /></button>
                    <ExpenseList
                      expenses={expenses}
                      onDelete={handleDeleteExpense}
                    />
                  </>
                )}

                {currentView === 'add-expense' && (
                  <div className="max-w-2xl mx-auto">
                    <ExpenseForm
                      onSave={handleSaveExpense}
                      onCancel={() => setCurrentView('expenses')}
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