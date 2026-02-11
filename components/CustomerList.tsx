// CustomerList.tsx
import React, { useState } from 'react';
import { Customer } from '../types';
import { 
  Trash2, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  MoreVertical,
  UserPlus
} from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* SEARCH BAR */}
      <div className="relative max-w-md group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 
          focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 sm:text-sm shadow-sm transition-all"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CUSTOMER CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              {searchTerm 
                ? `We couldn't find any results for "${searchTerm}"` 
                : "Your customer directory is empty. Start by adding your first client."}
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Customer Profile</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contact Information</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Billing Address</th>
                    <th className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="group hover:bg-gray-50/80 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {customer.name}
                            </div>
                            <div className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-tighter">
                              ID: {customer.id.slice(0, 12).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-col space-y-1.5">
                            {customer.email && (
                              <div className="flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">
                                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {customer.email}
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center text-sm text-gray-600 tabular-nums">
                                <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {customer.phone}
                              </div>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.address ? (
                          <div className="flex items-start max-w-xs text-sm text-gray-500 leading-tight">
                             <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                             <span className="truncate">{customer.address}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">No address provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEdit(customer)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDelete(customer.id)}
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
              {filteredCustomers.map((customer) => (
                <div 
                  key={customer.id} 
                  className="p-5 active:bg-gray-50 transition-colors"
                  onClick={() => onEdit(customer)}
                >
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center">
                         <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                              {customer.name.charAt(0).toUpperCase()}
                         </div>
                         <div className="ml-4">
                            <h3 className="text-base font-bold text-gray-900">{customer.name}</h3>
                            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-tighter">
                              Client
                            </span>
                         </div>
                     </div>
                     <div className="flex gap-1">
                       <button 
                         onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
                         className="p-2 text-gray-400 active:text-indigo-600 active:bg-indigo-50 rounded-lg"
                       >
                          <Edit2 className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); onDelete(customer.id); }}
                         className="p-2 text-gray-400 active:text-red-600 active:bg-red-50 rounded-lg"
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mt-2">
                      {customer.email && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <Mail className="w-3.5 h-3.5 mr-2.5 text-indigo-400" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <Phone className="w-3.5 h-3.5 mr-2.5 text-indigo-400" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <MapPin className="w-3.5 h-3.5 mr-2.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{customer.address}</span>
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

export default CustomerList;