import React from 'react';
import { SalesOrder } from '../types';
import {
  ShoppingCart,
  Calendar,
  User,
  Edit2,
  Trash2,
} from 'lucide-react';

interface SalesListProps {
  sales: SalesOrder[];
  onEdit?: (sale: SalesOrder) => void;
  onDelete?: (id: string) => void;
}

const SalesList: React.FC<SalesListProps> = ({ sales, onEdit, onDelete }) => {
  const showActions = !!onEdit || !!onDelete;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {sales.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No sales records found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Record a new sale to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  {showActions && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(sale.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {sale.customer?.name || 'Unknown Customer'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sale.items?.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      ) || 0}{' '}
                      items
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {sale.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      ${sale.total_amount.toFixed(2)}
                    </td>

                    {showActions && (
                      <td className="px-6 py-4 text-right text-sm">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(sale)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                            title="Edit sale"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(sale.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete sale"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesList;
