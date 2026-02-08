import { useState } from 'react';
import { Supplier, Product, PurchaseItem } from '../types';

export default function PurchaseOrderForm({
  suppliers,
  products,
  onSave,
  onCancel,
}: {
  suppliers: Supplier[];
  products: Product[];
  onSave: (po: {
    supplier_id: string;
    items: PurchaseItem[];
    total_amount: number;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const addItem = () =>
    setItems([...items, { product_id: '', quantity: 1, unit_cost: 0 }]);

  const total = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <select
        className="w-full border p-2"
        value={supplierId}
        onChange={e => setSupplierId(e.target.value)}
      >
        <option value="">Select Supplier</option>
        {suppliers.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {items.map((i, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2">
          <select
            className="border p-2"
            onChange={e => i.product_id = e.target.value}
          >
            <option value="">Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="number" min={1} onChange={e => i.quantity = +e.target.value} />
          <input type="number" min={0} onChange={e => i.unit_cost = +e.target.value} />
        </div>
      ))}

      <button onClick={addItem}>+ Add Item</button>

      <div className="flex justify-between">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={() =>
            onSave({ supplier_id: supplierId, items, total_amount: total })
          }
        >
          Save PO
        </button>
      </div>
    </div>
  );
}
