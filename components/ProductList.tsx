// ProductList.tsx
import React, { useState, useMemo } from 'react'
import { Product } from '../types'
import {
  Edit2,
  Trash2,
  Search,
  Layers,
  AlertCircle,
  TrendingUp,
  Package,
  MoreHorizontal,
  ImageOff
} from 'lucide-react'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

const LOW_STOCK_THRESHOLD = 10

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* SEARCH BAR */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 
          shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm"
          placeholder="Search by name, SKU, or description..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* EMPTY STATE */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 border-dashed text-center">
          <div className="p-4 bg-gray-50 rounded-full mb-3">
            <Layers className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
            We couldn't find anything matching "{searchTerm}". Try adjusting your search keywords.
          </p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* ===================== DESKTOP TABLE ===================== */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProducts.map(product => {
                  const margin = product.sell_price - product.cost_price
                  const marginPct = product.sell_price > 0
                    ? ((margin / product.sell_price) * 100).toFixed(1)
                    : '0'
                  
                  const isLowStock = product.stock <= LOW_STOCK_THRESHOLD
                  const isOutOfStock = product.stock === 0

                  return (
                    <tr
                      key={product.id}
                      className="group hover:bg-gray-50/80 transition-colors duration-200"
                    >
                      {/* Product Name & Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-indigo-600 bg-indigo-50 font-bold text-lg">
                                {product.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                              {product.has_variants ? (
                                <>
                                  <Layers className="w-3 h-3 mr-1" />
                                  {product.variants?.length ?? 0} Variants
                                </>
                              ) : (
                                'Single SKU'
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${isOutOfStock 
                            ? 'bg-gray-100 text-gray-800 border-gray-200'
                            : isLowStock 
                              ? 'bg-amber-50 text-amber-700 border-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                            ${isOutOfStock ? 'bg-gray-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          />
                          {product.stock} Units
                        </div>
                        {isLowStock && !isOutOfStock && (
                          <div className="text-[10px] text-amber-600 mt-1 font-medium pl-1">
                            Reorder soon
                          </div>
                        )}
                      </td>

                      {/* Sell Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 tabular-nums">
                        {formatCurrency(product.sell_price)}
                      </td>

                      {/* Margin */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm tabular-nums">
                        <div className="flex flex-col items-end">
                          <span className="text-gray-900 font-medium">{formatCurrency(margin)}</span>
                          <span className="text-xs text-green-600 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                            {marginPct}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => onEdit(product)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(product.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ===================== MOBILE CARDS ===================== */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= LOW_STOCK_THRESHOLD
              
              return (
                <div
                  key={product.id}
                  onClick={() => onEdit(product)}
                  className="bg-white rounded-xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-[0.98] transition-transform duration-200"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-indigo-500 font-bold text-xl bg-indigo-50/50">
                          {product.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                          {product.name}
                        </h3>
                        <span className="text-sm font-bold text-indigo-600 whitespace-nowrap">
                          {formatCurrency(product.sell_price)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-0.5 mb-2">
                        {product.has_variants ? `${product.variants?.length ?? 0} variants` : 'Single SKU'}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border
                            ${isLowStock 
                              ? 'bg-amber-50 text-amber-700 border-amber-100' 
                              : 'bg-green-50 text-green-700 border-green-100'
                            }`}
                        >
                          <Package className="w-3 h-3 mr-1" />
                          {product.stock} Left
                        </span>

                        {/* Mobile Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductList