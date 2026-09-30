import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Pencil, CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  purchaseOrders: any[];
  onDelete: (id: string) => void;
  onEdit: (po: any) => void;
  onMarkPaid: (id: string) => void;
  onMarkUnpaid: (id: string) => void;
  onRefresh: () => void;
}

const PurchaseOrderList: React.FC<Props> = ({
  purchaseOrders,
  onDelete,
  onEdit,
  onMarkPaid,
  onMarkUnpaid,
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

      {filtered.map(po => {
        const paid = po.status === 'paid';
        const chargesTotal = (po.charges ?? []).reduce(
          (s: number, c: any) => s + Number(c.amount || 0),
          0
        );
        return (
        <div
          key={po.id}
          className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900">
                  {po.supplier?.name || 'Unknown Supplier'}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    paid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {paid ? 'Paid' : 'Unpaid'}
                </span>
                {po.is_legacy && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    Legacy
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Bill #{po.id.slice(0, 6).toUpperCase()} · {formatDate(po.bill_date ?? po.created_at)}
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {paid ? (
              <button
                onClick={() => onMarkUnpaid(po.id)}
                className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Mark unpaid
              </button>
            ) : (
              <button
                onClick={() => onMarkPaid(po.id)}
                className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark paid
              </button>
            )}
            <button
              onClick={() => onEdit(po)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => onDelete(po.id)}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          {/* Details */}
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

              {Number(po.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 pt-1 border-t">
                  <span>
                    Discount{po.discount_type === 'percent' ? ` (${po.discount}%)` : ''}
                  </span>
                  <span className="font-medium tabular-nums">applied</span>
                </div>
              )}

              {(po.charges ?? []).length > 0 && (
                <div className="pt-1 border-t space-y-1">
                  {po.charges.map((c: any) => (
                    <div key={c.id} className="flex justify-between text-gray-600">
                      <span>
                        {c.category}
                        {c.description ? ` · ${c.description}` : ''}
                        {c.expense_id && (
                          <span className="ml-1 text-[10px] text-emerald-600">→ expense</span>
                        )}
                      </span>
                      <span className="font-medium tabular-nums">₹{Number(c.amount).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Charges total</span>
                    <span className="tabular-nums">₹{chargesTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No vendor bills found</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
