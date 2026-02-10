import React, { useState, useEffect } from 'react';
import {
  ViewState,
  Product,
  Customer,
  Supplier,
  SalesOrder,
  SalesItem,
  PurchaseOrder,
  PurchaseItem,
  Expense
} from './types';

import { inventoryService } from './services/inventoryService.supabase';
import { customerService } from './services/customerService.supabase';
import { supplierService } from './services/supplierService.supabase';
import { salesService } from './services/salesService.supabase';
import { purchaseService } from './services/purchaseService.supabase';
import { expenseService } from './services/expenseService.supabase';

import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import SupplierList from './components/SupplierList';
import SupplierForm from './components/SupplierForm';
import SalesList from './components/SalesList';
import SalesForm from './components/SalesForm';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import ProfitLoss from './components/ProfitLoss';

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
} from 'lucide-react';

/* =======================
   MOBILE BOTTOM NAV
======================= */
const MobileBottomNav = ({
  currentView,
  setCurrentView,
}: {
  currentView: ViewState;
  setCurrentView: (v: ViewState) => void;
}) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'sales', icon: ShoppingCart, label: 'Sales' },
    { id: 'expenses', icon: Wallet, label: 'Expenses' },
    { id: 'pl', icon: BarChart3, label: 'P&L' },
  ];

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
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingSale, setEditingSale] = useState<SalesOrder | undefined>();

  const [isLoading, setIsLoading] = useState(true);

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadCustomers(),
        loadSuppliers(),
        loadSales(),
        loadExpenses(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => setProducts(await inventoryService.getProducts());
  const loadCustomers = async () => setCustomers(await customerService.getCustomers());
  const loadSuppliers = async () => setSuppliers(await supplierService.getSuppliers());
  const loadSales = async () => setSales(await salesService.getSales());
  const loadExpenses = async () => setExpenses(await expenseService.getExpenses());

  /* -------------------- PRODUCT -------------------- */
  const handleSaveProduct = async (data: any) => {
    if (editingProduct) {
      await inventoryService.updateProduct({ ...data, id: editingProduct.id });
    } else {
      await inventoryService.addProduct(data);
    }
    await loadProducts();
    setEditingProduct(undefined);
    setCurrentView('inventory');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await inventoryService.deleteProduct(id);
    await loadProducts();
  };

  /* -------------------- SALES -------------------- */
  const handleSaveSale = async (data: {
    customer_id: string;
    items: SalesItem[];
    total_amount: number;
  }) => {
    if (editingSale) {
      await salesService.updateSale(editingSale.id, data);
      setEditingSale(undefined);
    } else {
      await salesService.createSale(data);
    }
    await Promise.all([loadSales(), loadProducts()]);
    setCurrentView('sales');
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Delete this sale? Stock will be restored.')) return;
    await salesService.deleteSale(id);
    await Promise.all([loadSales(), loadProducts()]);
  };

  /* -------------------- EXPENSE -------------------- */
  const handleSaveExpense = async (data: any) => {
    await expenseService.addExpense(data);
    await loadExpenses();
    setCurrentView('expenses');
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete expense?')) return;
    await expenseService.deleteExpense(id);
    await loadExpenses();
  };

  /* -------------------- NAV ITEM (DESKTOP) -------------------- */
  const NavItem = ({
    view,
    icon: Icon,
    label,
  }: {
    view: ViewState;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center w-full px-4 py-3 rounded-lg ${
        currentView === view
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 bg-white border-r">
        <div className="p-6 font-bold text-lg flex items-center">
          <Box className="mr-2" /> InventoryPro
        </div>
        <nav className="px-4 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="inventory" icon={Package} label="Inventory" />
          <NavItem view="sales" icon={ShoppingCart} label="Sales" />
          <NavItem view="customers" icon={Users} label="Customers" />
          <NavItem view="suppliers" icon={Truck} label="Suppliers" />
          <NavItem view="expenses" icon={Wallet} label="Expenses" />
          <NavItem view="pl" icon={BarChart3} label="Profit & Loss" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 pb-20 md:p-6">
        {isLoading ? (
          <div className="flex justify-center py-20">Loading…</div>
        ) : (
          <>
            {currentView === 'dashboard' && <Dashboard products={products} />}

            {currentView === 'inventory' && (
              <>
                <button
                  onClick={() => {
                    setEditingProduct(undefined);
                    setCurrentView('add-product');
                  }}
                  className="mb-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2" /> Add Product
                </button>
                <ProductList
                  products={products}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setCurrentView('edit-product');
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
                    setEditingSale(undefined);
                    setCurrentView('add-sale');
                  }}
                  className="mb-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2" /> New Sale
                </button>
                <SalesList
                  sales={sales}
                  onEdit={(s) => {
                    setEditingSale(s);
                    setCurrentView('edit-sale');
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
                  setEditingSale(undefined);
                  setCurrentView('sales');
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

      {/* MOBILE BOTTOM NAV */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
    </div>
  );
}
