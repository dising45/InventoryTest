import React, { useState } from 'react';
import { Supplier, Product } from '../types';
import PurchaseItemRow, {
  PurchaseItem,
} from './PurchaseItemRow';
import { purchaseService } from '../services/purchaseService.supabase';
import { inventoryService } from '../services/inventoryService.supabase';
import { Plus, Save } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  products: Product[];
  onSuccess: () => void;
  onCancel: () => void;
}

const PurchaseOrderForm: React.FC<Props> = ({
  suppliers,
  products,
  onSuccess,
  onCancel,
}) => {
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [saving, setSaving] = useState(false);

  /* ---------------- Add / Update Rows ---------------- */
  const updateItem = (index: number, updated: PurchaseItem) => {
    const copy = [...items];
    copy[index] = updated;
    setItems(copy);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        quantity: 1,
        unit_cost: 0,
      },
    ]);
  };

  /* ---------------- Inline Product Creation ---------------- */
  const createProduct = async (name: string, baseCost: number) => {
    const product = await inventoryService.addProduct({
      name,
      cost_price: baseCost,
      sell_price: baseCost,
      stock: 0,
      has_variants: false,
    });

    return product;
  };

  /* ---------------- Save PO ---------------- */
  const handleSave = async () => {
    if (!supplierId || items.length === 0) {
      alert('Supplier and at least one item required');
      return;
    }

    setSaving(true);
    try {
      await purchaseService.createPO({
        supplier_id: supplierId,
        items: items.map(i => ({
          product_id: i.product_id!,
          variant_id: i.variant_id,
          quantity: i.quantity,
          unit_cost: i.unit_cost,
        })),
      });

      onSuccess();
    } catch (e) {
      console.error(e);
      alert('Failed to create PO');
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_cost,
    0
  );

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        New Purchase Order
      </h2>

      {/* Supplier */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">Supplier</label>
        <select
          value={supplierId}
          onChange={e => setSupplierId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select supplier</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <PurchaseItemRow
            key={index}
            item={item}
            products={products}
            onChange={updated => updateItem(index, updated)}
            onRemove={() => removeItem(index)}
            onCreateProduct={createProduct}
          />
        ))}
      </div>

      {/* Add Row */}
      <button
        type="button"
        onClick={addRow}
        className="mt-4 flex items-center text-indigo-600 text-sm"
      >
        <Plus className="w-4 h-4 mr-1" /> Add item
      </button>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 border-t pt-4">
        <div className="text-lg font-semibold">
          Total: ₹{total.toFixed(2)}
        </div>

        <div className="space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white rounded flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving…' : 'Save PO'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
