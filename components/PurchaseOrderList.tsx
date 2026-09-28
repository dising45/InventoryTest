import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  purchaseOrders: any[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const PurchaseOrderList: React.FC<Props> = ({
  purchaseOrders,
  onDelete,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = purchaseOrders.filter(po =>
    !search ||
    po.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
    po.items?.some((i: any) =>
      i.product?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        placeholder="Search by supplier or product…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />

      {filtered.map(po => (
        <div
          key={po.id}
          className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-gray-900">
                {po.supplier?.name || 'Unknown Supplier'}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Bill #{po.id.slice(0, 6).toUpperCase()} · {formatDate(po.created_at)}
              </p>
              {po.notes && (
                <p className="text-xs text-gray-400 mt-0.5 italic">{po.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="text-sm font-black text-gray-900">₹{Number(po.total_amount).toLocaleString('en-IN')}</span>
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === po.id ? null : po.id
                  )
                }
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {expandedId === po.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              <button
                onClick={() => onDelete(po.id)}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items */}
          {expandedId === po.id && (
            <div className="mt-3 border-t pt-3 space-y-2 text-sm">
              {po.items.map((i: any) => (
                <div
                  key={i.id}
                  className="flex justify-between text-gray-700"
                >
                  <span>
                    {i.product?.name}
                    {i.variant?.name
                      ? ` (${i.variant.name})`
                      : ''}
                  </span>
                  <span className="font-medium tabular-nums">
                    {i.quantity} × ₹{i.unit_cost}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No vendor bills found</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
