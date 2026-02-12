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
  Menu
} from 'lucide-react'

/* =======================
   UI COMPONENTS
======================= */

const PrimaryButton = ({ onClick, children, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`group relative inline-flex items-center justify-center px-5 py-2.5 
    text-sm font-medium text-white transition-all duration-200 
    bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 
    hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-indigo-600 ${className}`}
  >
    {children}
  </button>
)

const PageHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
    {action && <div>{action}</div>}
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
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 pb-safe pt-2 md:hidden z-50 transition-all duration-300">
      <div className="flex justify-around items-center px-2 pb-2">
        {items.map(({ id, icon: Icon, label }) => {
          const isActive = currentView === id
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id as ViewState)}
              className={`relative flex flex-col items-center p-2 rounded-xl transition-all duration-200 group ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-b-full shadow-sm" />
              )}
              <Icon className={`w-6 h-6 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
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
      className={`relative flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 group
      ${isActive
          ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <Icon
        className={`w-5 h-5 mr-3.5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
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
  // NOTE: Added missing state variables implied by original code
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
      alert('Failed to save product. Please try again.')
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
      alert('Unable to save sale. Please check your internet connection and try again.')
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Delete this sale? Stock will be restored.')) return
    try {
      await salesService.deleteSale(id)
      await Promise.all([loadSales(), loadProducts()])
    } catch {
      alert('Failed to delete sale.')
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

  /* -------------------- MOBILE NAV VISIBILITY -------------------- */
  const hideMobileNav = [
    'add-product', 'edit-product',
    'add-sale', 'edit-sale',
    'add-expense',
    'add-customer', 'edit-customer',
    'add-supplier', 'edit-supplier'
  ].includes(currentView)

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-gray-50/50 md:flex font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 h-screen sticky top-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 text-indigo-700">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Box className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">InventoryPro</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <NavButton view="dashboard" icon={LayoutDashboard} label="Dashboard" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="inventory" icon={Package} label="Inventory" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="sales" icon={ShoppingCart} label="Sales" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="customers" icon={Users} label="Customers" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="suppliers" icon={Truck} label="Suppliers" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="expenses" icon={Wallet} label="Expenses" currentView={currentView} setCurrentView={setCurrentView} />
          <NavButton view="pl" icon={BarChart3} label="Profit & Loss" currentView={currentView} setCurrentView={setCurrentView} />
        </nav>

        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@inventory.pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-gray-400 font-medium animate-pulse">Loading data...</p>
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
                    title="Inventory Management"
                    action={
                      <PrimaryButton onClick={() => { setEditingProduct(undefined); setCurrentView('add-product'); }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                      </PrimaryButton>
                    }
                  />
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
                  <SalesList
                    sales={sales}
                    onEdit={s => { setEditingSale(s); setCurrentView('edit-sale'); }}
                    onDelete={handleDeleteSale}
                    onAddSale={() => { setEditingSale(undefined); setCurrentView('add-sale'); }}
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
                    title="Customer Directory"
                    action={
                      <PrimaryButton onClick={() => setCurrentView('add-customer')}>
                        <Plus className="w-4 h-4 mr-2" /> Add Customer
                      </PrimaryButton>
                    }
                  />
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
                    title="Supplier Network"
                    action={
                      <PrimaryButton onClick={() => setCurrentView('add-supplier')}>
                        <Plus className="w-4 h-4 mr-2" /> Add Supplier
                      </PrimaryButton>
                    }
                  />
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
                    title="Expense Tracking"
                    action={
                      <PrimaryButton onClick={() => setCurrentView('add-expense')}>
                        <Plus className="w-4 h-4 mr-2" /> Add Expense
                      </PrimaryButton>
                    }
                  />
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
                  <PageHeader title="Profit & Loss Statement" />
                  <ProfitLoss />
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {!hideMobileNav && (
        <MobileBottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}
    </div>
  )
}