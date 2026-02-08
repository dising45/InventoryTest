import React, { useState, useEffect } from 'react';
import { Customer, Product, SalesItem, Variant } from '../types';
import { ArrowLeft, Save, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface SalesFormProps {
  customers: Customer[];
  products: Product[];
  initialData?: {
    id: string;
    customer_id: string;
    items: SalesItem[];
  };
  onSave: (
    saleData: { customer_id: string; items: SalesItem[]; total_amount: number },
    saleId?: string
  ) => Promise<void>;
  onCancel: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({
  customers,
  products,
  initialData,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<SalesItem[]>([]);

  // Current item being added
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  /* -----------------------------------
     EDIT MODE INITIALIZATION
  ----------------------------------- */
  useEffect(() => {
    if (!initialData) return;

    setCustomerId(initialData.customer_id);

    const mappedItems = initialData.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      const variant = product?.variants.find(v => v.id === item.variant_id);

      return {
        ...item,
        product_name: product?.name ?? 'Unknown Product',
        variant_name: variant?.name,
      };
    });

    setItems(mappedItems);
  }, [initialData, products]);

  /* -----------------------------------
     AUTO PRICE UPDATE
  ----------------------------------- */
  useEffect(() => {
    if (!selectedProduct) {
      setUnitPrice(0);
      return;
    }

    if (selectedProduct.has_variants && selectedVariant) {
      setUnitPrice(
        selectedProduct.sell_price + (selectedVariant.price_modifier || 0)
      );
    } else {
      setUnitPrice(selectedProduct.sell_price);
    }
  }, [selectedProduct, selectedVariant]);

  /* -----------------------------------
     ADD / REMOVE ITEMS
  ----------------------------------- */
  const addItem = () => {
    if (!selectedProduct) return;
    if (selectedProduct.has_variants && !selectedVariant) return;

    const newItem: SalesItem = {
      product_id: selectedProduct.id,
      variant_id: selectedVariant?.id,
      quantity,
      unit_price: unitPrice,
      product_name: selectedProduct.name,
      variant_name: selectedVariant?.name,
    };

    setItems(prev => [...prev, newItem]);

    setSelectedProduct(undefined);
    setSelectedVariant(undefined);
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  /* -----------------------------------
     SUBMIT HANDLER
  ----------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0) return;

    setLoading(true);
    try {
      await onSave(
        {
          customer_id: customerId,
          items,
          total_amount: totalAmount,
        },
        initialData?.id
      );
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
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Sales Order' : 'New Sales Order'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4">Customer</h3>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className="w-full rounded-lg border px-4 py-2"
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Items */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>

            <select
              value={selectedProduct?.id || ''}
              onChange={e => {
                const prod = products.find(p => p.id === e.target.value);
                setSelectedProduct(prod);
                setSelectedVariant(undefined);
              }}
              className="w-full rounded-lg border px-4 py-2 mb-3"
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {selectedProduct?.has_variants && (
              <select
                value={selectedVariant?.id || ''}
                onChange={e =>
                  setSelectedVariant(
                    selectedProduct.variants.find(v => v.id === e.target.value)
                  )
                }
                className="w-full rounded-lg border px-4 py-2 mb-3"
              >
                <option value="">Select Variant</option>
                {selectedProduct.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Stock: {v.stock})
                  </option>
                ))}
              </select>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value) || 1)}
                className="rounded-lg border px-4 py-2"
              />
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={e => setUnitPrice(Number(e.target.value) || 0)}
                className="rounded-lg border px-4 py-2"
              />
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={!selectedProduct}
              className="mt-3 w-full bg-gray-100 rounded-lg py-2"
            >
              <Plus className="inline w-4 h-4 mr-2" /> Add Item
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
          <h3 className="font-semibold flex items-center mb-4">
            <ShoppingBag className="w-5 h-5 mr-2" /> Summary
          </h3>

          {items.map((item, i) => (
            <div key={i} className="flex justify-between mb-2 text-sm">
              <div>
                <p>{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-gray-500">
                    {item.variant_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                ${(item.quantity * item.unit_price).toFixed(2)}
                <button
                  onClick={() => removeItem(i)}
                  className="ml-2 text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg"
          >
            <Save className="inline w-4 h-4 mr-2" />
            {initialData ? 'Update Sale' : 'Save Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;
