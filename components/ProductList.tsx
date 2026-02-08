import React, { useState } from 'react';
import { Product } from '../types';
import { Edit2, Trash2, Search, Layers, AlertCircle } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-all"
          placeholder="Search inventory by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table / Mobile Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Layers className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new product.</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const margin = product.sell_price - product.buy_price;
                    const marginPercent = ((margin / product.sell_price) * 100).toFixed(1);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {product.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">{product.has_variants ? `${(product.variants ?? []).length} Variants` : 'Single Item'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                             product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                           }`}>
                             {product.stock} units
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.sell_price.toFixed(2)}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${margin.toFixed(2)} <span className="text-xs text-gray-400">({marginPercent}%)</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center">
                         <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                              {product.name.charAt(0)}
                         </div>
                         <div>
                            <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                            <span className={`inline-flex items-center text-xs font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                               {product.stock < 10 && <AlertCircle className="w-3 h-3 mr-1" />}
                               {product.stock} in stock
                            </span>
                         </div>
                     </div>
                     <p className="text-sm font-bold text-gray-900">${product.sell_price}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500">
                        {product.has_variants ? `${(product.variants ?? []).length} variants` : 'Standard'}
                      </span>
                      <div className="flex space-x-3">
                         <button 
                           onClick={() => onEdit(product)}
                           className="flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded"
                         >
                            Edit
                         </button>
                         <button 
                           onClick={() => onDelete(product.id)}
                           className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded"
                         >
                            Delete
                         </button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
