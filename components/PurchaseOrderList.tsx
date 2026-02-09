import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { purchaseService } from '../services/purchaseService.supabase';

interface Props {
  purchaseOrders: any[];
  onRefresh: () => void;
}

const PurchaseOrderList: React.FC<Props> = ({
  purchaseOrders,
  onRefresh,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = purchaseOrders.filter(po =>
    po.items?.some((i: any) =>
      i.product?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete PO? Stock will be rolled back.')) return;
    await purchaseService.deletePO(id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        placeholder="Search by product name…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      {filtered.map(po => (
        <div
          key={po.id}
          className="bg-white border rounded p-4"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                PO #{po.id.slice(0, 6)}
              </p>
              <p className="text-sm text-gray-500">
                {po.supplier?.name} · ₹{po.total_amount}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === po.id ? null : po.id
                  )
                }
              >
                {expandedId === po.id ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </button>

              <button
                onClick={() => handleDelete(po.id)}
                className="text-red-600"
              >
                <Trash2 />
              </button>
            </div>
          </div>

          {/* Items */}
          {expandedId === po.id && (
            <div className="mt-3 border-t pt-3 space-y-2 text-sm">
              {po.items.map((i: any) => (
                <div
                  key={i.id}
                  className="flex justify-between"
                >
                  <span>
                    {i.product?.name}
                    {i.variant?.name
                      ? ` (${i.variant.name})`
                      : ''}
                  </span>
                  <span>
                    {i.quantity} × ₹{i.unit_cost}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-gray-500">
          No purchase orders found
        </p>
      )}
    </div>
  );
};

export default PurchaseOrderList;
