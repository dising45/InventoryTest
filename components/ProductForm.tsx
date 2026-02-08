import React, { useState, useEffect } from 'react';
import { ProductWithVariants, Variant } from '../types';
import { createProduct, updateProduct } from '../services/inventoryService';

interface ProductFormProps {
  initialData?: ProductWithVariants;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ProductWithVariants>>({
    name: '',
    sku: '',
    price: 0,
    stock_quantity: 0,
    has_variants: false,
    ...initialData
  });

  const [variants, setVariants] = useState<Partial<Variant>[]>(initialData?.variants || []);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        // Prepare Variant Updates
        const created = variants.filter(v => !v.id);
        const updated = variants.filter(v => v.id && !deletedVariantIds.includes(v.id));
        
        await updateProduct(initialData.id, {
          name: formData.name,
          sku: formData.sku,
          price: Number(formData.price),
          stock_quantity: formData.has_variants ? 0 : Number(formData.stock_quantity),
          has_variants: formData.has_variants
        }, { created, updated, deletedIds: deletedVariantIds });
      } else {
        await createProduct({
          name: formData.name!,
          sku: formData.sku!,
          price: Number(formData.price),
          stock_quantity: formData.has_variants ? 0 : Number(formData.stock_quantity),
          has_variants: formData.has_variants!,
          supplier_id: formData.supplier_id // Should add supplier select
        }, variants as any);
      }
      onSuccess();
    } catch (err) {
      alert("Error saving product: " + err);
    }
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', sku: formData.sku + '-VAR', price_adjustment: 0, stock_quantity: 0 }]);
  };

  const removeVariant = (index: number) => {
    const v = variants[index];
    if (v.id) {
      setDeletedVariantIds([...deletedVariantIds, v.id]);
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-xl font-bold mb-4">{initialData ? 'Edit Product' : 'New Product'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input 
              required
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">SKU</label>
            <input 
              required
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Base Price</label>
            <input 
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <input 
            type="checkbox"
            id="has_variants"
            checked={formData.has_variants}
            onChange={e => setFormData({ ...formData, has_variants: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="has_variants" className="text-sm font-medium text-slate-700">This product has variants</label>
        </div>

        {!formData.has_variants ? (
          <div>
            <label className="block text-sm font-medium text-slate-700">Stock Quantity</label>
            <input 
              type="number"
              min="0"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              value={formData.stock_quantity}
              onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
            />
          </div>
        ) : (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-slate-900">Variants</h4>
              <button type="button" onClick={addVariant} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                + Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">Name</label>
                    <input 
                      placeholder="Size/Color"
                      className="w-full text-sm border p-1 rounded"
                      value={v.name}
                      onChange={e => handleVariantChange(i, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-slate-500">Stock</label>
                    <input 
                      type="number"
                      className="w-full text-sm border p-1 rounded"
                      value={v.stock_quantity}
                      onChange={e => handleVariantChange(i, 'stock_quantity', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-slate-500">Price (+/-)</label>
                    <input 
                      type="number"
                      className="w-full text-sm border p-1 rounded"
                      value={v.price_adjustment}
                      onChange={e => handleVariantChange(i, 'price_adjustment', parseFloat(e.target.value))}
                    />
                  </div>
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700 pb-1">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};