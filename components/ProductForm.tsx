import React, { useState, useEffect } from 'react';
import { Product, Variant } from '../types';
import { Trash2, Plus, ArrowLeft, Save } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
  onSave: (product: any) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    cost_price: 0,
    sell_price: 0,
    stock: 0,
    has_variants: false,
    variants: [],
    ...initialData,
  });

  // // Ensure variants is initialized
  // useEffect(() => {
  //   if (initialData) {
  //     setFormData(prev => ({
  //       ...prev,
  //       ...initialData,
  //       variants: initialData.variants || [],
  //     }));
  //   }
  // }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleVariantChange = (id: string, field: keyof Variant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      )
    }));
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: crypto.randomUUID(),
      name: '',
      sku: '',
      stock: 0,
      price_modifier: 0,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
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
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g., Summer T-Shirt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Product details..."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                name="sell_price"
                value={formData.sell_price}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.has_variants}
                  onChange={(e) => setFormData(prev => ({ ...prev, has_variants: e.target.checked }))}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">This product has variants</span>
                  <p className="text-xs text-gray-500">Enable if you have different sizes, colors, etc.</p>
                </div>
              </label>
            </div>

            {!formData.has_variants && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  required={!formData.has_variants}
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Variants Card */}
        {formData.has_variants && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Variant
              </button>
            </div>

            {(!formData.variants || formData.variants.length === 0) ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                No variants added yet. Click "Add Variant" to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Variant Name</th>
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3 font-medium">Extra Price ($)</th>
                      <th className="px-4 py-3 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formData.variants.map((variant) => (
                      <tr key={variant.id} className="group hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <input
                            required
                            type="text"
                            value={variant.name}
                            onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1"
                            placeholder="Size / Color"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1"
                            placeholder="SKU-123"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            required
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(variant.id, 'stock', parseFloat(e.target.value) || 0)}
                            className="w-20 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price_modifier}
                            onChange={(e) => handleVariantChange(variant.id, 'price_modifier', parseFloat(e.target.value) || 0)}
                            className="w-20 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(variant.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
