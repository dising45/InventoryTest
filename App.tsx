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
} from 'lucide-react'

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
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'sales', icon: ShoppingCart, label: 'Sales' },
    { id: 'expenses', icon: Wallet, label: 'Expenses' },
    { id: 'pl', icon: BarChart3, label: 'P&L' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 md:hidden z-50">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setCurrentView(id as ViewState)}
          className={`flex flex-col items-center text-xs ${
            currentView === id ? 'text-indigo-600' : 'text-gray-500'
          }`}
        >
          <Icon className="w-5 h-5 mb-1" />
          {label}
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const [currentView, setCurrentView] =
    useState<ViewState>('dashboard')

  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [sales, setSales] = useState<SalesOrder[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  const [editingProduct, setEditingProduct] =
    useState<Product | undefined>()
  const [editingSale, setEditingSale] =
    useState<SalesOrder | undefined>()

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

  const loadProducts = async () =>
    setProducts(await inventoryService.getProducts())
  const loadCustomers = async () =>
    setCustomers(await customerService.getCustomers())
  const loadSuppliers = async () =>
    setSuppliers(await supplierService.getSuppliers())
  const loadSales = async () =>
    setSales(await salesService.getSales())
  const loadExpenses = async () =>
    setExpenses(await expenseService.getExpenses())

  /* -------------------- PRODUCT -------------------- */
  const handleSaveProduct = async (data: any) => {
    try {
      if (editingProduct) {
        await inventoryService.updateProduct({
          ...data,
          id: editingProduct.id,
        })
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

  /* -------------------- SALES (STRICT, NON-OPTIMISTIC) -------------------- */
  const handleSaveSale = async (data: {
    customer_id: string
    items: SalesItem[]
    total_amount: number
  }) => {
    try {
      if (editingSale) {
        await salesService.updateSale(editingSale.id, data)
        setEditingSale(undefined)
      } else {
        await salesService.createSale(data)
      }

      // ✅ Only after DB success
      await Promise.all([loadSales(), loadProducts()])
      setCurrentView('sales')
    } catch (e) {
      alert(
        'Unable to save sale. Please check your internet connection and try again.'
      )
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

  /* -------------------- EXPENSE -------------------- */
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
    'add-product',
    'edit-product',
    'add-sale',
    'edit-sale',
    'add-expense',
  ].includes(currentView)

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 bg-white border-r">
        <div className="p-6 font-bold text-lg flex items-center">
          <Box className="mr-2" /> InventoryPro
        </div>
        <nav className="px-4 space-y-2">
          <NavButton view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavButton view="inventory" icon={Package} label="Inventory" />
          <NavButton view="sales" icon={ShoppingCart} label="Sales" />
          <NavButton view="customers" icon={Users} label="Customers" />
          <NavButton view="suppliers" icon={Truck} label="Suppliers" />
          <NavButton view="expenses" icon={Wallet} label="Expenses" />
          <NavButton view="pl" icon={BarChart3} label="Profit & Loss" />
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 pb-20 md:p-6">
        {isLoading ? (
          <div className="flex justify-center py-20">Loading…</div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <Dashboard products={products} />
            )}

            {currentView === 'inventory' && (
              <>
                <button
                  onClick={() => {
                    setEditingProduct(undefined)
                    setCurrentView('add-product')
                  }}
                  className="mb-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2" /> Add Product
                </button>
                <ProductList
                  products={products}
                  onEdit={p => {
                    setEditingProduct(p)
                    setCurrentView('edit-product')
                  }}
                  onDelete={handleDeleteProduct}
                />
              </>
            )}

            {(currentView === 'add-product' ||
              currentView === 'edit-product') && (
              <ProductForm
                initialData={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => setCurrentView('inventory')}
              />
            )}

            {currentView === 'sales' && (
              <>
                <button
                  onClick={() => {
                    setEditingSale(undefined)
                    setCurrentView('add-sale')
                  }}
                  className="mb-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2" /> New Sale
                </button>
                <SalesList
                  sales={sales}
                  onEdit={s => {
                    setEditingSale(s)
                    setCurrentView('edit-sale')
                  }}
                  onDelete={handleDeleteSale}
                />
              </>
            )}

            {(currentView === 'add-sale' ||
              currentView === 'edit-sale') && (
              <SalesForm
                customers={customers}
                products={products}
                initialData={editingSale}
                onSave={handleSaveSale}
                onCancel={() => {
                  setEditingSale(undefined)
                  setCurrentView('sales')
                }}
              />
            )}

            {currentView === 'expenses' && (
              <>
                <button
                  onClick={() => setCurrentView('add-expense')}
                  className="mb-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2" /> Add Expense
                </button>
                <ExpenseList
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                />
              </>
            )}

            {currentView === 'add-expense' && (
              <ExpenseForm
                onSave={handleSaveExpense}
                onCancel={() => setCurrentView('expenses')}
              />
            )}

            {currentView === 'pl' && <ProfitLoss />}
          </>
        )}
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

/* -------------------- DESKTOP NAV BUTTON -------------------- */
const NavButton = ({
  view,
  icon: Icon,
  label,
}: {
  view: ViewState
  icon: any
  label: string
}) => (
  <button className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </button>
)
