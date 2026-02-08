import React, { useState, useEffect } from 'react';
import { Customer, Product, SalesItem, Variant } from '../types';
import { ArrowLeft, Save, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface SalesFormProps {
  customers: Customer[];
  products: Product[];
  onSave: (saleData: { customer_id: string; items: SalesItem[]; total_amount: number }) => Promise<void>;
  onCancel: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ customers, products, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<SalesItem[]>([]);
  
  // Current item being added
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  // Update price when product/variant selection changes
  useEffect(() => {
    if (!selectedProduct) {
      setUnitPrice(0);
      return;
    }
    
    if (selectedProduct.has_variants && selectedVariant) {
      setUnitPrice(selectedProduct.sell_price + (selectedVariant.price_modifier || 0));
    } else {
      setUnitPrice(selectedProduct.sell_price);
    }
  }, [selectedProduct, selectedVariant]);

  const addItem = () => {
    if (!selectedProduct) return;
    if (selectedProduct.has_variants && !selectedVariant) return;

    const newItem: SalesItem = {
      product_id: selectedProduct.id,
      variant_id: selectedVariant?.id,
      quantity,
      unit_price: unitPrice,
      product_name: selectedProduct.name,
      variant_name: selectedVariant?.name
    };

    setItems([...items, newItem]);
    
    // Reset selection
    setSelectedProduct(undefined);
    setSelectedVariant(undefined);
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0) return;

    setLoading(true);
    try {
      await onSave({
        customer_id: customerId,
        items,
        total_amount: totalAmount
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900">New Sales Order</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Add Item Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === e.target.value);
                    setSelectedProduct(prod);
                    setSelectedVariant(undefined);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProduct?.has_variants && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                  <select
                    value={selectedVariant?.id || ''}
                    onChange={(e) => {
                      const v = selectedProduct.variants.find(v => v.id === e.target.value);
                      setSelectedVariant(v);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Select Variant</option>
                    {selectedProduct.variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Stock: {v.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct || (selectedProduct.has_variants && !selectedVariant)}
                className="mt-2 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Line Item
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" /> Order Summary
            </h3>
            
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm border-b border-gray-50 pb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        {item.variant_name && <p className="text-xs text-gray-500">Var: {item.variant_name}</p>}
                        <p className="text-xs text-gray-500">{item.quantity} x ${item.unit_price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">${(item.quantity * item.unit_price).toFixed(2)}</span>
                        <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 mt-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-base font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={loading || items.length === 0 || !customerId}
                    className={`w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all ${
                      (loading || items.length === 0 || !customerId) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Processing...' : 'Complete Sale'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;
