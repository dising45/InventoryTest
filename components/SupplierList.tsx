import React, { useState } from 'react';
import { Supplier } from '../types';
import { Trash2, Search, Truck, Mail, Phone, MapPin, User } from 'lucide-react';

interface SupplierListProps {
  suppliers: Supplier[];
  onDelete: (id: string) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
          placeholder="Search suppliers by company or contact person..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table / Mobile Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Truck className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
            <p className="mt-1 text-sm text-gray-500">Add a new supplier to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                            {supplier.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            {supplier.contact_person && (
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <User className="w-3 h-3 mr-1" />
                                {supplier.contact_person}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-col space-y-1">
                            {supplier.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="w-3 h-3 mr-1.5" />
                                {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-3 h-3 mr-1.5" />
                                {supplier.phone}
                              </div>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.address ? (
                          <div className="flex items-center max-w-xs truncate">
                             <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" />
                             {supplier.address}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No address</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => onDelete(supplier.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center">
                         <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mr-3">
                              {supplier.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <h3 className="text-sm font-medium text-gray-900">{supplier.name}</h3>
                            {supplier.contact_person && (
                              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                <User className="w-3 h-3 mr-1" /> {supplier.contact_person}
                              </p>
                            )}
                         </div>
                     </div>
                     <button 
                       onClick={() => onDelete(supplier.id)}
                       className="p-1 text-gray-400 hover:text-red-600"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="space-y-2 pl-13">
                      {supplier.email && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="w-3 h-3 mr-2" />
                          {supplier.email}
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="w-3 h-3 mr-2" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-2" />
                          {supplier.address}
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
