import React, { useState, useEffect } from 'react';
import { Customer, ProductWithVariants, SalesItem, Variant } from '../types';
import { getCustomers } from '../services/customerService';
import { getProducts } from '../services/inventoryService';
import { createSale } from '../services/salesService';

interface SalesFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({ onSuccess, onCancel }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<Partial<SalesItem>[]>([]);
  
  // Selection State
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const init = async () => {
      setCustomers(await getCustomers());
      setProducts(await getProducts());
    };
    init();
  }, []);

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const price = selectedVariant 
      ? selectedProduct.price + selectedVariant.price_adjustment 
      : selectedProduct.price;

    const availableStock = selectedVariant ? selectedVariant.stock_quantity : selectedProduct.stock_quantity;

    if (qty > availableStock) {
      alert(`Insufficient stock! Only ${availableStock} available.`);
      return;
    }

    const newItem: Partial<SalesItem> = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      variant_id: selectedVariant?.id,
      variant_name: selectedVariant?.name,
      quantity: qty,
      unit_price: price,
      subtotal: price * qty
    };

    setCart([...cart, newItem]);
    
    // Reset selection
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQty(1);
  };

  const handleProductSelect = (productId: string) => {
    const p = products.find(prod => prod.id === productId) || null;
    setSelectedProduct(p);
    setSelectedVariant(null);
    setQty(1);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId || cart.length === 0) return;
    try {
      const total = cart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      await createSale(selectedCustomerId, total, cart as any);
      onSuccess();
    } catch (err) {
      alert("Sale failed: " + err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-slate-200 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">New Sales Order</h3>
      
      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Left Col: Selections */}
        <div className="col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Customer</label>
            <select 
              className="mt-1 block w-full border border-slate-300 rounded-md p-2"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            <h4 className="font-medium text-slate-800">Add Item</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500">Product</label>
                <select 
                  className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={selectedProduct?.id || ''}
                  onChange={e => handleProductSelect(e.target.value)}
                >
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {selectedProduct?.has_variants && (
                <div>
                  <label className="block text-xs font-medium text-slate-500">Variant</label>
                  <select 
                    className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                    value={selectedVariant?.id || ''}
                    onChange={e => setSelectedVariant(selectedProduct.variants?.find(v => v.id === e.target.value) || null)}
                  >
                    <option value="">Select Variant</option>
                    {selectedProduct.variants?.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Stock: {v.stock_quantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-end gap-4">
               <div className="w-24">
                 <label className="block text-xs font-medium text-slate-500">Quantity</label>
                 <input 
                   type="number" min="1" 
                   className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                   value={qty}
                   onChange={e => setQty(parseInt(e.target.value))}
                 />
               </div>
               <button 
                 disabled={!selectedProduct || (selectedProduct.has_variants && !selectedVariant)}
                 onClick={addToCart}
                 className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50 text-sm"
               >
                 Add to Cart
               </button>
            </div>
          </div>

          {/* Cart Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Item</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Total</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">
                      <div className="font-medium text-slate-900">{item.product_name}</div>
                      <div className="text-xs text-slate-500">{item.variant_name}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-right">${item.subtotal?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">&times;</button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400 text-sm">Cart is empty</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Summary */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h4>
            <div className="space-y-2 text-sm text-slate-600">
               <div className="flex justify-between">
                 <span>Subtotal</span>
                 <span>${cart.reduce((sum, i) => sum + (i.subtotal || 0), 0).toFixed(2)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Tax (0%)</span>
                 <span>$0.00</span>
               </div>
               <div className="flex justify-between font-bold text-slate-900 text-lg pt-4 border-t border-slate-200 mt-4">
                 <span>Total</span>
                 <span>${cart.reduce((sum, i) => sum + (i.subtotal || 0), 0).toFixed(2)}</span>
               </div>
            </div>
          </div>
          
          <div className="space-y-3 mt-8">
            <button 
              onClick={handleSubmit}
              disabled={cart.length === 0 || !selectedCustomerId}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 shadow-lg shadow-primary-500/30"
            >
              Complete Sale
            </button>
            <button onClick={onCancel} className="w-full bg-white text-slate-700 py-3 rounded-lg font-medium border border-slate-300 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};