import React, { useState, useEffect } from 'react';
import { ViewState, Product, Customer, Supplier } from './types';
import { inventoryService } from "./services/inventoryService.supabase";
import { customerService } from './services/customerService.supabase'
import { supplierService } from './services/supplierService.supabase';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import SupplierList from './components/SupplierList';
import SupplierForm from './components/SupplierForm';
import { LayoutDashboard, Package, Plus, LogOut, Menu, X, Box, Users, Truck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadProducts(), loadCustomers(), loadSuppliers()]);
    } catch (error) {
      console.error("Failed to load data", error);
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

  // Product Handlers
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
      setCurrentView('inventory');
      setEditingProduct(undefined);
    } catch (error) {
      alert("Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await inventoryService.deleteProduct(id);
        await loadProducts();
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  const handleEditProductInit = (product: Product) => {
    setEditingProduct(product);
    setCurrentView('edit-product');
  };

  const handleAddProductInit = () => {
    setEditingProduct(undefined);
    setCurrentView('add-product');
  };

  // Customer Handlers
  const handleSaveCustomer = async (customerData: any) => {
    try {
      await customerService.addCustomer(customerData);
      await loadCustomers();
      setCurrentView('customers');
    } catch (error) {
      alert("Failed to save customer");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await customerService.deleteCustomer(id);
        await loadCustomers();
      } catch (error) {
        alert("Failed to delete customer");
      }
    }
  };

  // Supplier Handlers
  const handleSaveSupplier = async (supplierData: any) => {
    try {
      await supplierService.addSupplier(supplierData);
      await loadSuppliers();
      setCurrentView('suppliers');
    } catch (error) {
      alert("Failed to save supplier");
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await supplierService.deleteSupplier(id);
        await loadSuppliers();
      } catch (error) {
        alert("Failed to delete supplier");
      }
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => {
    const isActive =
      currentView === view ||
      (view === 'inventory' && (currentView === 'add-product' || currentView === 'edit-product')) ||
      (view === 'customers' && currentView === 'add-customer') ||
      (view === 'suppliers' && currentView === 'add-supplier');

    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">InventoryPro</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-100 hidden md:flex">
            <div className="bg-indigo-600 p-1.5 rounded-lg mr-3">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">InventoryPro</span>
          </div>

          <div className="flex-1 px-4 py-6 space-y-2 mt-14 md:mt-0">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="inventory" icon={Package} label="Inventory" />
            <NavItem view="customers" icon={Users} label="Customers" />
            <NavItem view="suppliers" icon={Truck} label="Suppliers" />
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header Action Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === 'dashboard' && 'Dashboard Overview'}
                {currentView === 'inventory' && 'Product Inventory'}
                {currentView === 'add-product' && 'New Product'}
                {currentView === 'edit-product' && 'Edit Product'}
                {currentView === 'customers' && 'Customer Management'}
                {currentView === 'add-customer' && 'New Customer'}
                {currentView === 'suppliers' && 'Supplier Management'}
                {currentView === 'add-supplier' && 'New Supplier'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentView === 'dashboard' && 'Track performance and stock levels'}
                {currentView === 'inventory' && 'Manage your entire catalog'}
                {currentView === 'customers' && 'View and manage your customer base'}
                {currentView === 'suppliers' && 'Manage your supply chain partners'}
                {(currentView === 'add-product' || currentView === 'edit-product' || currentView === 'add-customer' || currentView === 'add-supplier') && 'Fill in the details below'}
              </p>
            </div>

            {/* Contextual Action Button */}
            {(currentView === 'inventory') && (
              <button
                onClick={handleAddProductInit}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </button>
            )}

            {(currentView === 'customers') && (
              <button
                onClick={() => setCurrentView('add-customer')}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Customer
              </button>
            )}

            {(currentView === 'suppliers') && (
              <button
                onClick={() => setCurrentView('add-supplier')}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Supplier
              </button>
            )}
          </div>

          {/* Views */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && <Dashboard products={products} />}
              {currentView === 'inventory' && (
                <ProductList
                  products={products}
                  onEdit={handleEditProductInit}
                  onDelete={handleDeleteProduct}
                />
              )}
              {(currentView === 'add-product' || currentView === 'edit-product') && (
                <ProductForm
                  initialData={editingProduct}
                  onSave={handleSaveProduct}
                  onCancel={() => setCurrentView('inventory')}
                />
              )}
              {currentView === 'customers' && (
                <CustomerList
                  customers={customers}
                  onDelete={handleDeleteCustomer}
                />
              )}
              {currentView === 'add-customer' && (
                <CustomerForm
                  onSave={handleSaveCustomer}
                  onCancel={() => setCurrentView('customers')}
                />
              )}
              {currentView === 'suppliers' && (
                <SupplierList
                  suppliers={suppliers}
                  onDelete={handleDeleteSupplier}
                />
              )}
              {currentView === 'add-supplier' && (
                <SupplierForm
                  onSave={handleSaveSupplier}
                  onCancel={() => setCurrentView('suppliers')}
                />
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
