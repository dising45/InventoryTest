// SupplierList.tsx
import React, { useState } from 'react';
import { Supplier } from '../types';
import { 
  Trash2, 
  Search, 
  Truck, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Edit2, 
  MoreHorizontal,
  Building2 
} from 'lucide-react';

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* SEARCH BAR */}
      <div className="relative max-w-md group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 
          focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 sm:text-sm shadow-sm transition-all"
          placeholder="Search company or contact person..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* SUPPLIER CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="p-4 bg-emerald-50 rounded-full mb-4">
              <Truck className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">No suppliers found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              {searchTerm 
                ? `No results for "${searchTerm}". Try a different name.` 
                : "Your supplier network is empty. Add your vendors to manage procurement."}
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Company & Contact</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contact Information</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Office Location</th>
                    <th className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="group hover:bg-emerald-50/30 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm">
                            {supplier.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {supplier.name}
                            </div>
                            {supplier.contact_person && (
                              <div className="flex items-center text-[11px] text-gray-500 mt-0.5 font-medium">
                                <User className="w-3 h-3 mr-1 text-emerald-400" />
                                {supplier.contact_person}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-col space-y-1.5">
                            {supplier.email && (
                              <div className="flex items-center text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center text-sm text-gray-600 tabular-nums">
                                <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {supplier.phone}
                              </div>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {supplier.address ? (
                          <div className="flex items-start max-w-xs text-sm text-gray-500 leading-tight">
                             <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                             <span className="truncate">{supplier.address}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">No address provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => onEdit(supplier)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDelete(supplier.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredSuppliers.map((supplier) => (
                <div 
                  key={supplier.id} 
                  className="p-5 active:bg-gray-50 transition-colors"
                  onClick={() => onEdit(supplier)}
                >
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center">
                         <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
                              {supplier.name.charAt(0).toUpperCase()}
                         </div>
                         <div className="ml-4">
                            <h3 className="text-base font-bold text-gray-900">{supplier.name}</h3>
                            <div className="flex items-center text-xs text-emerald-600 font-medium mt-0.5">
                              <Building2 className="w-3 h-3 mr-1" />
                              Vendor
                            </div>
                         </div>
                     </div>
                     <div className="flex gap-1">
                       <button 
                         onClick={(e) => { e.stopPropagation(); onEdit(supplier); }}
                         className="p-2 text-gray-400 active:text-emerald-600 active:bg-emerald-50 rounded-lg"
                       >
                          <Edit2 className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); onDelete(supplier.id); }}
                         className="p-2 text-gray-400 active:text-red-600 active:bg-red-50 rounded-lg"
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mt-2">
                      {supplier.contact_person && (
                        <div className="flex items-center text-xs text-gray-600 font-medium px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                          <User className="w-3.5 h-3.5 mr-2.5 text-emerald-400" />
                          {supplier.contact_person}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {supplier.email && (
                          <div className="flex items-center text-xs text-gray-500 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <Mail className="w-3.5 h-3.5 mr-2.5 text-emerald-400" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center text-xs text-gray-500 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <Phone className="w-3.5 h-3.5 mr-2.5 text-emerald-400" />
                            {supplier.phone}
                          </div>
                        )}
                      </div>
                      {supplier.address && (
                        <div className="flex items-center text-xs text-gray-500 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <MapPin className="w-3.5 h-3.5 mr-2.5 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">{supplier.address}</span>
                        </div>
                      )}
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

export default SupplierList;