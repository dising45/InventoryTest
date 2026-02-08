import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { SalesList } from './components/SalesList';
import { SalesForm } from './components/SalesForm';

function App() {
  const [view, setView] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCreatingSale, setIsCreatingSale] = useState(false);

  const renderContent = () => {
    // 1. Dashboard
    if (view === 'dashboard') return <Dashboard />;

    // 2. Inventory
    if (view === 'inventory') {
      if (isCreatingProduct || editingProduct) {
        return (
          <ProductForm 
            initialData={editingProduct} 
            onSuccess={() => { setEditingProduct(null); setIsCreatingProduct(false); }}
            onCancel={() => { setEditingProduct(null); setIsCreatingProduct(false); }}
          />
        );
      }
      return (
        <ProductList 
          onCreate={() => setIsCreatingProduct(true)}
          onEdit={(p) => setEditingProduct(p)}
        />
      );
    }

    // 3. Sales
    if (view === 'sales') {
      if (isCreatingSale) {
        return (
          <SalesForm 
            onSuccess={() => setIsCreatingSale(false)}
            onCancel={() => setIsCreatingSale(false)}
          />
        );
      }
      return <SalesList onCreate={() => setIsCreatingSale(true)} />;
    }

    // Other placeholders
    return (
      <div className="p-10 text-center text-slate-500">
        <h3 className="text-lg font-medium">Module "{view}" under construction</h3>
        <p>This module is part of the Phase 2 rollout.</p>
      </div>
    );
  };

  return (
    <Layout activeView={view} onNavigate={(v) => {
      setView(v);
      setEditingProduct(null);
      setIsCreatingProduct(false);
      setIsCreatingSale(false);
    }}>
      {renderContent()}
    </Layout>
  );
}

export default App;