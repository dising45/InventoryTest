import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export interface PurchaseItem {
  product_id?: string;
  product_name?: string;   // set when adding a new product inline
  variant_id?: string | null;
  quantity: number;
  unit_cost: number;
}

interface Props {
  item: PurchaseItem;
  products: Product[];
  onChange: (item: PurchaseItem) => void;
  onRemove: () => void;
  onCreateProduct: (name: string, baseCost: number) => Promise<Product>;
}

const PurchaseItemRow: React.FC<Props> = ({
  item,
  products,
  onChange,
  onRemove,
}) => {
  const [isNew, setIsNew] = useState(false);
  const selectedProduct = products.find(p => p.id === item.product_id);

  const switchToNew = () => {
    setIsNew(true);
    onChange({ ...item, product_id: undefined, product_name: '' });
  };

  const switchToExisting = () => {
    setIsNew(false);
    onChange({ ...item, product_id: undefined, product_name: undefined });
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-end border-b pb-3">
      {/* Product */}
      <div className="col-span-4">
        <label className="text-xs text-gray-600">Product</label>

        {!isNew ? (
          <>
            <select
              value={item.product_id || ''}
              onChange={e => onChange({ ...item, product_id: e.target.value || undefined, product_name: undefined, variant_id: null })}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={switchToNew}
              className="mt-1 text-xs text-indigo-600 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Add new product
            </button>
          </>
        ) : (
          <div className="space-y-1">
            <input
              placeholder="Product name"
              value={item.product_name ?? ''}
              onChange={e => onChange({ ...item, product_name: e.target.value })}
              className="w-full border rounded px-2 py-1"
              autoFocus
            />
            <p className="text-[10px] text-indigo-500 font-medium">New product — will be created on save</p>
            <button
              type="button"
              onClick={switchToExisting}
              className="text-xs text-gray-500 flex items-center"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Pick existing instead
            </button>
          </div>
        )}
      </div>

      {/* Variant (only for existing products with variants) */}
      <div className="col-span-3">
        <label className="text-xs text-gray-600">Variant</label>
        <select
          value={item.variant_id || ''}
          onChange={e => onChange({ ...item, variant_id: e.target.value || null })}
          disabled={!selectedProduct?.has_variants}
          className="w-full border rounded px-2 py-1 disabled:opacity-40"
        >
          <option value="">—</option>
          {selectedProduct?.variants?.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="col-span-2">
        <label className="text-xs text-gray-600">Qty</label>
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={e => onChange({ ...item, quantity: Number(e.target.value) || 1 })}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      {/* Unit Cost */}
      <div className="col-span-2">
        <label className="text-xs text-gray-600">Unit Cost</label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={item.unit_cost}
          onChange={e => onChange({ ...item, unit_cost: Number(e.target.value) || 0 })}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      {/* Delete */}
      <div className="col-span-1 flex justify-center">
        <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PurchaseItemRow;
