import React, { useState, useMemo } from 'react'
import { Product } from '../types'
import {
  Edit2,
  Trash2,
  Search,
  Layers,
  AlertCircle,
  TrendingUp,
  Plus,
} from 'lucide-react'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onAddNew?: () => void // 🔥 optional floating button
}

const LOW_STOCK_THRESHOLD = 10

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return products.filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    )
  }, [products, searchTerm])

  return (
    <div className="relative space-y-4 animate-in fade-in duration-300">
      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
          placeholder="Search products…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* EMPTY STATE */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center shadow-sm">
          <Layers className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try a different keyword or add a new product
          </p>
        </div>
      ) : (
        <>
          {/* ===================== DESKTOP ===================== */}
          <div className="hidden md:block bg-white rounded-2xl border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sell Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => {
                  const margin =
                    product.sell_price - product.cost_price
                  const marginPct =
                    product.sell_price > 0
                      ? ((margin / product.sell_price) * 100).toFixed(1)
                      : '0'

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-10 rounded-xl object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {product.name.charAt(0)}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.has_variants
                                ? `${product.variants?.length ?? 0} variants`
                                : 'Single item'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stock < LOW_STOCK_THRESHOLD
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        ₹{product.sell_price.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          ₹{margin.toFixed(2)} ({marginPct}%)
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => onEdit(product)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ===================== MOBILE ===================== */}
          <div className="md:hidden space-y-4">
            {filteredProducts.map(product => {
              const lowStock =
                product.stock < LOW_STOCK_THRESHOLD

              return (
                <div
                  key={product.id}
                  onClick={() => onEdit(product)}
                  className="bg-white rounded-3xl p-4 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-16 w-16 rounded-2xl object-cover border"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {product.name.charAt(0)}
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ₹{product.sell_price}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.has_variants
                            ? `${product.variants?.length ?? 0} variants`
                            : 'Standard product'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        lowStock
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>

                  {lowStock && (
                    <div className="mt-3 flex items-center text-xs text-red-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Low stock
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ===================== GLASS FLOATING ADD BUTTON ===================== */}
      {onAddNew && (
        <button
          onClick={onAddNew}
          className="fixed bottom-6 right-6 z-50 backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 text-black" />
        </button>
      )}
    </div>
  )
}

export default ProductList
