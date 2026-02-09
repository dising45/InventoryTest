import React, { useState } from 'react';
import { Supplier, Product } from '../types';
import { Plus, Trash2, Save } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  products: Product[];
  onSave: (data: {
    supplier_id: string;
    items: {
      product_id?: string;
      product_name: string;
      variant_id?: string;
      quantity: number;
      unit_cost: number;
    }[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function PurchaseOrderForm({
  suppliers,
  products,
  onSave,
  onCancel,
}: Props) {
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const [productId, setProductId] = useState<string | undefined>();
  const [productName, setProductName] = useState('');
  const [variantId, setVariantId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const selectedProduct = products.find(p => p.id === productId);

  const addItem = () => {
    if (!productName && !productId) return;

    setItems([
      ...items,
      {
        product_id: productId,
        product_name:
          productName || selectedProduct?.name || 'Unknown',
        variant_id: variantId,
        quantity,
        unit_cost: unitCost,
      },
    ]);

    setProductId(undefined);
    setProductName('');
    setVariantId(undefined);
    setQuantity(1);
    setUnitCost(0);
  };

  const total = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_cost,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">New Purchase Order</h2>

      <select
        className="w-full border p-2 rounded"
        value={supplierId}
        onChange={e => setSupplierId(e.target.value)}
      >
        <option value="">Select Supplier</option>
        {suppliers.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* ADD ITEM */}
      <div className="border rounded p-4 space-y-3">
        <select
          className="w-full border p-2 rounded"
          value={productId || ''}
          onChange={e => {
            setProductId(e.target.value || undefined);
            setProductName('');
          }}
        >
          <option value="">Select Existing Product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {!productId && (
          <input
            placeholder="New product name"
            className="w-full border p-2 rounded"
            value={productName}
            onChange={e => setProductName(e.target.value)}
          />
        )}

        {selectedProduct?.variants?.length > 0 && (
          <select
            className="w-full border p-2 rounded"
            onChange={e => setVariantId(e.target.value)}
          >
            <option value="">Select Variant</option>
            {selectedProduct.variants.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Quantity"
            className="border p-2 rounded"
            value={quantity}
            onChange={e => setQuantity(+e.target.value)}
          />
          <input
            type="number"
            placeholder="Unit Cost"
            className="border p-2 rounded"
            value={unitCost}
            onChange={e => setUnitCost(+e.target.value)}
          />
        </div>

        <button
          onClick={addItem}
          className="flex items-center bg-gray-100 px-3 py-2 rounded"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </button>
      </div>

      {/* ITEMS */}
      {items.map((i, idx) => (
        <div key={idx} className="flex justify-between border-b py-2">
          <div>
            <b>{i.product_name}</b>
            <div className="text-sm text-gray-500">
              {i.quantity} × {i.unit_cost}
            </div>
          </div>
          <button onClick={() =>
            setItems(items.filter((_, x) => x !== idx))
          }>
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ))}

      <div className="text-right font-bold">
        Total: ₹{total.toFixed(2)}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() =>
            onSave({ supplier_id: supplierId, items })
          }
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          <Save className="w-4 h-4 inline mr-1" /> Save PO
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
