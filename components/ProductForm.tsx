import React, { useState, useEffect } from 'react'
import { Product, Variant } from '../types'
import { Trash2, Plus, ArrowLeft, Save, Image as ImageIcon } from 'lucide-react'
import { imageService } from '../services/imageService.supabase'

interface ProductFormProps {
  initialData?: Product
  onSave: (product: any) => Promise<void>
  onCancel: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    cost_price: 0,
    sell_price: 0,
    stock: 0,
    has_variants: false,
    image_url: '',
    variants: [],
    ...initialData,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        variants: initialData.variants || [],
      })
    }
  }, [initialData])

  /* ---------------- BASIC CHANGE ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0]) return

    try {
      const url = await imageService.uploadProductImage(
        e.target.files[0]
      )

      setFormData(prev => ({
        ...prev,
        image_url: url,
      }))
    } catch (err) {
      alert('Image upload failed')
    }
  }

  const handleVariantImageUpload = async (
    variantId: string,
    file: File
  ) => {
    try {
      const url = await imageService.uploadProductImage(file)

      setFormData(prev => ({
        ...prev,
        variants: prev.variants?.map(v =>
          v.id === variantId ? { ...v, image_url: url } : v
        ),
      }))
    } catch {
      alert('Variant image upload failed')
    }
  }

  /* ---------------- VARIANTS ---------------- */

  const addVariant = () => {
    const newVariant: Variant = {
      id: crypto.randomUUID(),
      name: '',
      sku: '',
      stock: 0,
      price_modifier: 0,
      image_url: '',
    }

    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }))
  }

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== id),
    }))
  }

  const handleVariantChange = (
    id: string,
    field: keyof Variant,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }))
  }

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center text-gray-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <h2 className="text-xl font-bold">
          {initialData ? 'Edit Product' : 'Add Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PRODUCT IMAGE */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Product Image</h3>

          {formData.image_url ? (
            <img
              src={formData.image_url}
              alt="Product"
              className="w-24 h-24 object-cover rounded mb-3"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleProductImageUpload}
          />
        </div>

        {/* BASIC INFO */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <input
            required
            type="text"
            name="name"
            placeholder="Product name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              placeholder="Cost Price"
              className="border rounded px-3 py-2"
            />
            <input
              required
              type="number"
              name="sell_price"
              value={formData.sell_price}
              onChange={handleChange}
              placeholder="Sell Price"
              className="border rounded px-3 py-2"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.has_variants}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  has_variants: e.target.checked,
                }))
              }
            />
            Has Variants
          </label>

          {!formData.has_variants && (
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="border rounded px-3 py-2 w-full"
            />
          )}
        </div>

        {/* VARIANTS */}
        {formData.has_variants && (
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center text-indigo-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </button>
            </div>

            {formData.variants?.map(v => (
              <div key={v.id} className="border p-4 rounded space-y-2">
                {v.image_url ? (
                  <img
                    src={v.image_url}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    e.target.files &&
                    handleVariantImageUpload(v.id, e.target.files[0])
                  }
                />

                <input
                  type="text"
                  value={v.name}
                  placeholder="Variant name"
                  onChange={e =>
                    handleVariantChange(v.id, 'name', e.target.value)
                  }
                  className="w-full border rounded px-2 py-1"
                />

                <input
                  type="number"
                  value={v.stock}
                  onChange={e =>
                    handleVariantChange(
                      v.id,
                      'stock',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full border rounded px-2 py-1"
                />

                <button
                  type="button"
                  onClick={() => removeVariant(v.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded"
          >
            <Save className="w-4 h-4 inline mr-1" />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
