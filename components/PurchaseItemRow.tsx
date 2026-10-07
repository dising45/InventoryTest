import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { Plus, Trash2, ArrowLeft, Search, X } from 'lucide-react';

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
  allowCreate?: boolean; // when false (legacy bills), only existing products can be picked
}

const PurchaseItemRow: React.FC<Props> = ({
  item,
  products,
  onChange,
  onRemove,
  allowCreate = true,
}) => {
  const [isNew, setIsNew] = useState(false);
  const selectedProduct = products.find(p => p.id === item.product_id);

  /* Searchable product combobox state */
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Filter by name or SKU. Unlike the POS picker, zero-stock items stay
  // selectable — restocking is exactly when stock is low or empty.
  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }, [products, query]);

  // Close the dropdown on an outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pickProduct = (p: Product) => {
    onChange({ ...item, product_id: p.id, product_name: undefined, variant_id: null });
    setQuery('');
    setIsOpen(false);
  };

  const clearProduct = () => {
    onChange({ ...item, product_id: undefined, product_name: undefined, variant_id: null });
    setQuery('');
    setIsOpen(true);
  };

  const switchToNew = () => {
    setIsNew(true);
    setIsOpen(false);
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
            <div ref={pickerRef} className="relative">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={isOpen ? query : (selectedProduct?.name ?? '')}
                  onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                  onFocus={() => { setQuery(''); setIsOpen(true); }}
                  placeholder={selectedProduct ? selectedProduct.name : 'Search product'}
                  className="w-full border rounded pl-7 pr-6 py-1"
                />
                {selectedProduct && !isOpen && (
                  <button
                    type="button"
                    onClick={clearProduct}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-56 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-gray-400 text-center">No products found</p>
                  ) : (
                    filtered.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickProduct(p)}
                        className={`w-full flex items-center gap-2 text-left px-2 py-1.5 text-sm hover:bg-indigo-50 ${
                          p.id === item.product_id ? 'bg-indigo-50 font-medium' : ''
                        }`}
                      >
                        <span className="w-7 h-7 rounded bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-indigo-500 font-bold text-xs bg-indigo-50">
                              {p.name.charAt(0)}
                            </span>
                          )}
                        </span>
                        <span className="flex-1 min-w-0 truncate">
                          {p.name}
                          {p.sku && <span className="ml-1 text-[10px] text-gray-400">{p.sku}</span>}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={switchToNew}
              disabled={!allowCreate}
              className="mt-1 text-xs text-indigo-600 flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
              title={allowCreate ? undefined : 'Legacy bills can only reference existing products'}
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
