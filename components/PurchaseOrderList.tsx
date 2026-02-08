import { PurchaseOrder } from '../types';
import { Trash2 } from 'lucide-react';

export default function PurchaseOrderList({
  orders,
  onDelete,
}: {
  orders: PurchaseOrder[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Supplier</th>
            <th className="p-3 text-right">Total</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-t">
              <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
              <td className="p-3">{o.supplier?.name}</td>
              <td className="p-3 text-right">₹{o.total_amount}</td>
              <td className="p-3 text-right">
                <button onClick={() => onDelete(o.id)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
