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
    setProducts(await inventoryService.getProducts());
  };

  const loadCustomers = async () => {
    setCustomers(await customerService.getCustomers());
  };

  const loadSuppliers = async () => {
    setSuppliers(await supplierService.getSuppliers());
  };

  const loadSales = async () => {
    setSales(await salesService.getSales());
  };

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

  /* -------------------- NAV ITEM -------------------- */
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
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

            {currentView === 'customers' && (
              <>
                <button
                  onClick={() => setCurrentView('add-customer')}
                  className="mb-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2" /> Add Customer
                </button>
                <CustomerList customers={customers} onDelete={() => {}} />
              </>
            )}

            {currentView === 'add-customer' && (
              <CustomerForm
                onSave={async (data) => {
                  await customerService.addCustomer(data);
                  await loadCustomers();
                  setCurrentView('customers');
                }}
                onCancel={() => setCurrentView('customers')}
              />
            )}

            {currentView === 'suppliers' && (
              <>
                <button
                  onClick={() => setCurrentView('add-supplier')}
                  className="mb-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Plus className="mr-2" /> Add Supplier
                </button>
                <SupplierList suppliers={suppliers} onDelete={() => {}} />
              </>
            )}

            {currentView === 'add-supplier' && (
              <SupplierForm
                onSave={async (data) => {
                  await supplierService.addSupplier(data);
                  await loadSuppliers();
                  setCurrentView('suppliers');
                }}
                onCancel={() => setCurrentView('suppliers')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
