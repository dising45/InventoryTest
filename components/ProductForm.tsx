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
  Loader2
} from 'lucide-react'
import { imageService } from '../services/imageService.supabase'

interface ProductFormProps {
  initialData?: Product
  onSave: (product: any) => Promise<void>
  onCancel: () => void
}

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,          // stronger compression
      maxWidth: 1200,        // resize width
      maxHeight: 1200,
      convertSize: 500000,   // force convert if >500kb
      success(result) {
        const compressedFile = new File(
          [result],
          file.name,
          { type: 'image/jpeg' }  // force jpeg
        )

        console.log(
          'Original size:',
          (file.size / 1024 / 1024).toFixed(2),
          'MB'
        )
        console.log(
          'Compressed size:',
          (compressedFile.size / 1024 / 1024).toFixed(2),
          'MB'
        )

        resolve(compressedFile)
      },
      error(err) {
        reject(err)
      },
    })
  })
}

/* ================= UI HELPER COMPONENTS ================= */

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}
  </label>
)

const InputField = ({ icon: Icon, className, ...props }: any) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
    )}
    <input
      className={`block w-full rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm py-2.5 ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
      {...props}
    />
  </div>
)

const Toggle = ({ checked, onChange, label }: { checked: boolean, onChange: (checked: boolean) => void, label: string }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" onClick={() => onChange(!checked)}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${checked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
        <Layers className="w-5 h-5" />
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
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

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          quality: 0.6,              // stronger compression
          maxWidth: 1200,
          maxHeight: 1200,
          mimeType: 'image/jpeg',    // 🔥 FORCE JPEG
          success(result) {
            const compressed = new File(
              [result],
              `${Date.now()}.jpg`,   // 🔥 new filename
              { type: 'image/jpeg' }
            )

            console.log(
              'Original:',
              (file.size / 1024 / 1024).toFixed(2),
              'MB'
            )
            console.log(
              'Compressed:',
              (compressed.size / 1024 / 1024).toFixed(2),
              'MB'
            )

            resolve(compressed)
          },
          error(err) {
            reject(err)
          },
        })
      })

      const url = await imageService.uploadProductImage(compressedFile)

      setFormData(prev => ({
        ...prev,
        image_url: url,
      }))

    } catch (err) {
      console.error('IMAGE UPLOAD ERROR', err)
      alert('Image upload failed')
    } finally {
      setLoading(false)
    }
  }
  // const handleVariantImageUpload = async (variantId: string, file: File) => {
  //   setLoading(true)
  //   try {
  //     const url = await imageService.uploadProductImage(file)
  //     setFormData(prev => ({
  //       ...prev,
  //       variants: prev.variants?.map(v =>
  //         v.id === variantId ? { ...v, image_url: url } : v
  //       ),
  //     }))
  //   } catch {
  //     alert('Variant image upload failed')
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const handleVariantImageUpload = async (
    variantId: string,
    file: File
  ) => {
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
            const compressed = new File(
              [result],
              `${Date.now()}.jpg`,
              { type: 'image/jpeg' }
            )

            resolve(compressed)
          },
          error(err) {
            reject(err)
          },
        })
      })

      const url = await imageService.uploadProductImage(compressedFile)

      setFormData(prev => ({
        ...prev,
        variants: prev.variants?.map(v =>
          v.id === variantId
            ? { ...v, image_url: url }
            : v
        )
      }))

    } catch (err) {
      console.error('VARIANT IMAGE ERROR', err)
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

  const handleVariantChange = (id: string, field: keyof Variant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      ),
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

  /* ---------------- RENDER ---------------- */

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialData ? 'Edit Product' : 'Create New Product'}
            </h2>
            <p className="text-sm text-gray-500">Fill in the details below to manage your inventory.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: IMAGE & TOGGLES */}
        <div className="space-y-6">

          {/* IMAGE UPLOAD CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <Label>Product Image</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group relative mt-2 flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
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
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-indigo-500">
                  <div className="p-4 rounded-full bg-white shadow-sm mb-3 group-hover:shadow-md transition-all">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="mb-1 text-sm font-medium"><span className="text-indigo-500">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                </div>
              )}

              {/* Overlay for change image */}
              {formData.image_url && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Change Image
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
            label="This product has variants"
            checked={formData.has_variants || false}
            onChange={(val) => setFormData(prev => ({ ...prev, has_variants: val }))}
          />

        </div>

        {/* RIGHT COLUMN: FORM FIELDS */}
        <div className="lg:col-span-2 space-y-6">

          {/* BASIC INFO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">General Information</h3>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <Label>Product Name</Label>
                <InputField
                  required
                  type="text"
                  name="name"
                  icon={Tag}
                  placeholder="e.g. Nike Air Max"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Description</Label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm py-2.5 pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <Label>Cost Price</Label>
                <InputField
                  required
                  type="number"
                  name="cost_price"
                  icon={IndianRupee}
                  value={formData.cost_price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Selling Price</Label>
                <InputField
                  required
                  type="number"
                  name="sell_price"
                  icon={IndianRupee}
                  value={formData.sell_price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {!formData.has_variants && (
              <div className="pt-2">
                <Label>Stock Quantity</Label>
                <InputField
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

          {/* VARIANTS SECTION */}
          {formData.has_variants && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
                  <p className="text-sm text-gray-500">Manage size, color, or other options</p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Option
                </button>
              </div>

              <div className="space-y-4">
                {formData.variants?.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Layers className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No variants added yet</p>
                  </div>
                )}

                {formData.variants?.map((v, index) => (
                  <div key={v.id} className="group flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200">

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
                        className="block w-full h-full rounded-lg border border-gray-200 bg-white overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors"
                      >
                        {v.image_url ? (
                          <img src={v.image_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </label>
                    </div>

                    {/* Variant Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Variant Name</label>
                        <input
                          type="text"
                          value={v.name}
                          placeholder="e.g. XL / Red"
                          onChange={e => handleVariantChange(v.id, 'name', e.target.value)}
                          className="w-full rounded-lg border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Stock</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={e => handleVariantChange(v.id, 'stock', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-end justify-end md:justify-start">
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductForm