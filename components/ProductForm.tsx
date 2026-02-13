// ProductForm.tsx
import Compressor from 'compressorjs'
import React, { useState, useEffect, useRef } from 'react'
import { Product, Variant } from '../types'
import {
  Trash2,
  Plus,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  UploadCloud,
  Package,
  Tag,
  IndianRupee,
  Layers,
  FileText,
  Loader2,
  Info
} from 'lucide-react'
import { imageService } from '../services/imageService.supabase'

interface ProductFormProps {
  initialData?: Product
  onSave: (product: any) => Promise<void>
  onCancel: () => void
}

/* ================= HELPERS ================= */

const InputField = ({ label, icon: Icon, className, ...props }: any) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
    )}
    <div className="relative group">
      {!label && Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
      )}
      <input
        className={`block w-full rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm py-3 
        ${!label && Icon ? 'pl-10' : 'px-4'} ${className}`}
        {...props}
      />
    </div>
  </div>
)

const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (checked: boolean) => void, label: string }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200
    ${checked ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`} 
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-colors ${checked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
        <Layers className="w-5 h-5" />
      </div>
      <div>
        <span className={`font-bold text-sm ${checked ? 'text-indigo-900' : 'text-gray-700'}`}>{label}</span>
        <p className="text-[10px] text-gray-500 mt-0.5">Enable if this product has sizes, colors, etc.</p>
      </div>
    </div>
    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </div>
)

/* ================= MAIN COMPONENT ================= */

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed')
      return
    }

    setLoading(true)
    try {
      const compressedFile: File = await new Promise((resolve, reject) => {
        new Compressor(file, {
          quality: 0.6,
          maxWidth: 1200,
          maxHeight: 1200,
          mimeType: 'image/jpeg',
          success(result) {
            resolve(new File([result], `${Date.now()}.jpg`, { type: 'image/jpeg' }))
          },
          error(err) { reject(err) },
        })
      })

      const url = await imageService.uploadProductImage(compressedFile)
      setFormData(prev => ({ ...prev, image_url: url }))
    } catch (err) {
      console.error('IMAGE UPLOAD ERROR', err)
      alert('Image upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVariantImageUpload = async (variantId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed')
      return
    }
    setLoading(true)
    try {
      const compressedFile: File = await new Promise((resolve, reject) => {
        new Compressor(file, {
          quality: 0.6,
          maxWidth: 1200,
          maxHeight: 1200,
          mimeType: 'image/jpeg',
          success(result) {
            resolve(new File([result], `${Date.now()}.jpg`, { type: 'image/jpeg' }))
          },
          error(err) { reject(err) },
        })
      })
      const url = await imageService.uploadProductImage(compressedFile)
      setFormData(prev => ({
        ...prev,
        variants: prev.variants?.map(v => v.id === variantId ? { ...v, image_url: url } : v)
      }))
    } catch (err) {
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const addVariant = () => {
    const newVariant: Variant = {
      id: crypto.randomUUID(),
      name: '',
      sku: '',
      stock: 0,
      price_modifier: 0,
      image_url: '',
    }
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }))
  }

  const removeVariant = (id: string) => {
    setFormData(prev => ({ ...prev, variants: prev.variants?.filter(v => v.id !== id) }))
  }

  const handleVariantChange = (id: string, field: keyof Variant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v => v.id === id ? { ...v, [field]: value } : v),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-24 md:pb-0">
      
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="group p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialData ? 'Edit Product' : 'New Product'}
            </h2>
            <p className="text-sm text-gray-500">Inventory Management</p>
          </div>
        </div>

        {/* Desktop Save Button */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: IMAGE & TOGGLES */}
        <div className="space-y-6">

          {/* IMAGE UPLOAD CARD */}
          <div className="bg-white p-5 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider mb-2 block">Product Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group relative mt-1 flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
                ${formData.image_url
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'
                }`}
            >
              {formData.image_url ? (
                <img
                  src={formData.image_url}
                  alt="Product"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-indigo-500 transition-colors">
                  <div className="p-4 rounded-full bg-white shadow-sm mb-3 group-hover:shadow-md transition-all">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="mb-1 text-sm font-bold text-gray-900">Upload Image</p>
                  <p className="text-xs text-gray-400">JPG, PNG or GIF (Max 5MB)</p>
                </div>
              )}

              {/* Overlay for change image */}
              {formData.image_url && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white font-bold flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <ImageIcon className="w-4 h-4" /> Change Photo
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleProductImageUpload}
            />
          </div>

          {/* VARIANTS TOGGLE */}
          <Toggle
            label="Enable Variants"
            checked={formData.has_variants || false}
            onChange={(val) => setFormData(prev => ({ ...prev, has_variants: val }))}
          />
        </div>

        {/* RIGHT COLUMN: FORM FIELDS */}
        <div className="lg:col-span-2 space-y-6">

          {/* BASIC INFO */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-indigo-600" />
            <div className="p-6 space-y-5">
              <h3 className="text-lg font-bold text-gray-900">General Information</h3>

              <div className="space-y-5">
                <InputField
                  required
                  label="Product Name"
                  type="text"
                  name="name"
                  icon={Tag}
                  placeholder="e.g. Nike Air Max"
                  value={formData.name}
                  onChange={handleChange}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Describe your product features and details..."
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm py-3 px-4 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 pt-2">
                <InputField
                  required
                  label="Cost Price"
                  type="number"
                  name="cost_price"
                  icon={IndianRupee}
                  value={formData.cost_price}
                  onChange={handleChange}
                />
                <InputField
                  required
                  label="Selling Price"
                  type="number"
                  name="sell_price"
                  icon={IndianRupee}
                  value={formData.sell_price}
                  onChange={handleChange}
                />
              </div>

              {!formData.has_variants && (
                <div className="pt-2">
                  <InputField
                    label="Stock Quantity"
                    type="number"
                    name="stock"
                    icon={Package}
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* VARIANTS SECTION */}
          {formData.has_variants && (
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Manage stock for different options</p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.variants?.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <Layers className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm font-medium text-gray-900">No variants added</p>
                      <p className="text-xs text-gray-400">Add options like Size, Color, etc.</p>
                    </div>
                  )}

                  {formData.variants?.map((v, index) => (
                    <div key={v.id} className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                      
                      {/* Variant Image */}
                      <div className="relative w-full md:w-20 h-20 flex-shrink-0">
                        <input
                          type="file"
                          id={`variant-img-${v.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={e => e.target.files && handleVariantImageUpload(v.id, e.target.files[0])}
                        />
                        <label
                          htmlFor={`variant-img-${v.id}`}
                          className="block w-full h-full rounded-lg border border-gray-200 bg-gray-50 overflow-hidden cursor-pointer hover:border-indigo-400 transition-all"
                        >
                          {v.image_url ? (
                            <img src={v.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 hover:text-indigo-500">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        </label>
                      </div>

                      {/* Variant Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Option Name</label>
                          <input
                            type="text"
                            value={v.name}
                            placeholder="e.g. XL / Red"
                            onChange={e => handleVariantChange(v.id, 'name', e.target.value)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                          <input
                            type="number"
                            value={v.stock}
                            onChange={e => handleVariantChange(v.id, 'stock', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Addon Price</label>
                          <input
                            type="number"
                            value={v.price_modifier || 0}
                            onChange={e => handleVariantChange(v.id, 'price_modifier', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          />
                        </div>
                        <div className="flex items-end justify-end md:justify-start">
                          <button
                            type="button"
                            onClick={() => removeVariant(v.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE STICKY SAVE BUTTON */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  )
}

export default ProductForm