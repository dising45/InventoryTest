import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { SalesList } from './components/SalesList';
import { SalesForm } from './components/SalesForm';

/**
 * App View Types
 */
type AppView =
  | 'dashboard'
  | 'inventory'
  | 'sales'
  | 'customers'
  | 'suppliers';

function App() {
  const [view, setView] = useState<AppView>('dashboard');

  // Inventory state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Sales state
  const [isCreatingSale, setIsCreatingSale] = useState(false);

  const resetTransientState = () => {
    setEditingProduct(null);
    setIsCreatingProduct(false);
    setIsCreatingSale(false);
  };

  const renderContent = () => {
    /* ---------------- DASHBOARD ---------------- */
    if (view === 'dashboard') {
      return <Dashboard />;
    }

    /* ---------------- INVENTORY ---------------- */
    if (view === 'inventory') {
      if (isCreatingProduct || editingProduct) {
        return (
          <ProductForm
            initialData={editingProduct}
            onSuccess={() => {
              setEditingProduct(null);
              setIsCreatingProduct(false);
            }}
            onCancel={() => {
              setEditingProduct(null);
              setIsCreatingProduct(false);
            }}
          />
        );
      }

      return (
        <ProductList
          onCreate={() => setIsCreatingProduct(true)}
          onEdit={(product) => setEditingProduct(product)}
        />
      );
    }

    /* ---------------- SALES ---------------- */
    if (view === 'sales') {
      if (isCreatingSale) {
        return (
          <SalesForm
            onSuccess={() => setIsCreatingSale(false)}
            onCancel={() => setIsCreatingSale(false)}
          />
        );
      }

      return (
        <SalesList
          onCreate={() => setIsCreatingSale(true)}
        />
      );
    }

    /* ---------------- PLACEHOLDERS ---------------- */
    return (
      <div className="p-10 text-center text-slate-500">
        <h3 className="text-lg font-medium">
          Module "{view}" under construction
        </h3>
        <p className="mt-2 text-sm">
          This module is planned for Phase 2.
        </p>
      </div>
    );
  };

  return (
    <Layout
      activeView={view}
      onNavigate={(nextView) => {
        resetTransientState();
        setView(nextView as AppView);
      }}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
