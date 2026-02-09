import React, { useState } from 'react';
import { Product, Variant } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export interface PurchaseItem {
  product_id?: string;
  variant_id?: string | null;
  quantity: number;
  unit_cost: number;
}

interface Props {
  item: PurchaseItem;
  products: Product[];
  onChange: (item: PurchaseItem) => void;
  onRemove: () => void;

  // Inline creation hooks
  onCreateProduct: (name: string, baseCost: number) => Promise<Product>;
  onCreateVariant?: (
    productId: string,
    name: string,
    priceModifier: number
  ) => Promise<Variant>;
}

const PurchaseItemRow: React.FC<Props> = ({
  item,
  products,
  onChange,
  onRemove,
  onCreateProduct,
  onCreateVariant,
}) => {
  const selectedProduct = products.find(p => p.id === item.product_id);
  const selectedVariant =
    selectedProduct?.variants?.find(v => v.id === item.variant_id);

  /* ---------------- New Product ---------------- */
  const [newProductName, setNewProductName] = useState('');
  const [newProductCost, setNewProductCost] = useState(0);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const handleCreateProduct = async () => {
    if (!newProductName || newProductCost <= 0) return;

    const product = await onCreateProduct(newProductName, newProductCost);
    onChange({
      ...item,
      product_id: product.id,
      variant_id: null,
      unit_cost: newProductCost,
    });

    setNewProductName('');
    setNewProductCost(0);
    setCreatingProduct(false);
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="grid grid-cols-12 gap-3 items-end border-b pb-3">
      {/* Product */}
      <div className="col-span-4">
        <label className="text-xs text-gray-600">Product</label>

        {!creatingProduct ? (
          <>
            <select
              value={item.product_id || ''}
              onChange={e =>
                onChange({
                  ...item,
                  product_id: e.target.value,
                  variant_id: null,
                })
              }
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setCreatingProduct(true)}
              className="mt-1 text-xs text-indigo-600 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Add new product
            </button>
          </>
        ) : (
          <div className="space-y-1">
            <input
              placeholder="Product name"
              value={newProductName}
              onChange={e => setNewProductName(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
            <input
              type="number"
              placeholder="Base cost"
              value={newProductCost}
              onChange={e => setNewProductCost(Number(e.target.value))}
              className="w-full border rounded px-2 py-1"
            />
            <button
              type="button"
              onClick={handleCreateProduct}
              className="w-full bg-indigo-600 text-white text-xs py-1 rounded"
            >
              Create product
            </button>
          </div>
        )}
      </div>

      {/* Variant (optional) */}
      <div className="col-span-3">
        <label className="text-xs text-gray-600">Variant</label>
        <select
          value={item.variant_id || ''}
          onChange={e =>
            onChange({ ...item, variant_id: e.target.value || null })
          }
          disabled={!selectedProduct?.has_variants}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">—</option>
          {selectedProduct?.variants?.map(v => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
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
          onChange={e =>
            onChange({ ...item, quantity: Number(e.target.value) || 1 })
          }
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
          onChange={e =>
            onChange({ ...item, unit_cost: Number(e.target.value) || 0 })
          }
          className="w-full border rounded px-2 py-1"
        />
      </div>

      {/* Delete */}
      <div className="col-span-1 flex justify-center">
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PurchaseItemRow;
