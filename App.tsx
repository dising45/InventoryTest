import React, { useState, useEffect } from 'react';
import {
  ViewState,
  Product,
  Customer,
  Supplier,
  SalesOrder,
  SalesItem,
} from './types';

import { inventoryService } from './services/inventoryService.supabase';
import { customerService } from './services/customerService.supabase';
import { supplierService } from './services/supplierService.supabase';
import { salesService } from './services/salesService.supabase';

import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import SupplierList from './components/SupplierList';
import SupplierForm from './components/SupplierForm';
import SalesList from './components/SalesList';
import SalesForm from './components/SalesForm';

import {
  LayoutDashboard,
  Package,
  Plus,
  Menu,
  X,
  Box,
  Users,
  Truck,
  ShoppingCart,
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<SalesOrder[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingSale, setEditingSale] = useState<SalesOrder | undefined>();

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    const data = await inventoryService.getProducts();
    setProducts(data);
  };

  const loadCustomers = async () => {
    const data = await customerService.getCustomers();
    setCustomers(data);
  };

  const loadSuppliers = async () => {
    const data = await supplierService.getSuppliers();
    setSuppliers(data);
  };

  const loadSales = async () => {
    const data = await salesService.getSales();
    setSales(data);
  };

  /* -------------------- PRODUCT -------------------- */
  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        await inventoryService.updateProduct({
          ...productData,
          id: editingProduct.id,
        });
      } else {
        await inventoryService.addProduct(productData);
      }

      await loadProducts();
      setEditingProduct(undefined);
      setCurrentView('inventory');
    } catch {
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await inventoryService.deleteProduct(id);
    await loadProducts();
  };

  /* -------------------- SALES -------------------- */
  const handleSaveSale = async (saleData: {
    customer_id: string;
    items: SalesItem[];
    total_amount: number;
  }) => {
    try {
      if (editingSale) {
        await salesService.updateSale(editingSale.id, saleData);
        setEditingSale(undefined);
      } else {
        await salesService.createSale(saleData);
      }

      await Promise.all([loadSales(), loadProducts()]);
      setCurrentView('sales');
    } catch (e) {
      console.error(e);
      alert('Failed to save sale');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Delete this sale? Stock will be restored.')) return;

    await salesService.deleteSale(id);
    await Promise.all([loadSales(), loadProducts()]);
  };

  /* -------------------- NAV ITEM -------------------- */
  const NavItem = ({
    view,
    icon: Icon,
    label,
  }: {
    view: ViewState;
    icon: any;
    label: string;
  }) => {
    const isActive =
      currentView === view ||
      (view === 'inventory' &&
        (currentView === 'add-product' ||
          currentView === 'edit-product')) ||
      (view === 'sales' &&
        (currentView === 'add-sale' ||
          currentView === 'edit-sale'));

    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 rounded-lg ${
          isActive
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </button>
    );
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6 font-bold text-lg flex items-center">
          <Box className="mr-2" /> InventoryPro
        </div>
        <nav className="px-4 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="inventory" icon={Package} label="Inventory" />
          <NavItem view="sales" icon={ShoppingCart} label="Sales" />
          <NavItem view="customers" icon={Users} label="Customers" />
          <NavItem view="suppliers" icon={Truck} label="Suppliers" />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
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

            {currentView === 'customers' && (
              <CustomerList customers={customers} onDelete={() => {}} />
            )}

            {currentView === 'suppliers' && (
              <SupplierList suppliers={suppliers} onDelete={() => {}} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
