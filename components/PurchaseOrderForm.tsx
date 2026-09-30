import React, { useState } from 'react';
import { Supplier, Product, PurchaseOrder } from '../types';
import PurchaseItemRow, {
  PurchaseItem,
} from './PurchaseItemRow';
import { purchaseService } from '../services/purchaseService.supabase';
import { inventoryService } from '../services/inventoryService.supabase';
import { Plus, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from './ui';

interface Props {
  suppliers: Supplier[];
  products: Product[];
  editingPO?: PurchaseOrder;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ChargeRow {
  description: string;
  amount: number;
  category: string;
}

const CHARGE_CATEGORIES = ['Shipping', 'Packaging', 'Marketing', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

const PurchaseOrderForm: React.FC<Props> = ({
  suppliers,
  products,
  editingPO,
  onSuccess,
  onCancel,
}) => {
  const isEdit = !!editingPO;

  const [supplierId, setSupplierId] = useState(editingPO?.supplier_id ?? '');
  const [billDate, setBillDate] = useState(editingPO?.bill_date ?? today());
  const [notes, setNotes] = useState(editingPO?.notes ?? '');
  const [items, setItems] = useState<PurchaseItem[]>(
    editingPO?.items?.map(i => ({
      product_id: i.product_id,
      variant_id: i.variant_id ?? null,
      quantity: i.quantity,
      unit_cost: i.unit_cost,
    })) ?? []
  );
  const [discount, setDiscount] = useState<number>(editingPO?.discount ?? 0);
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>(
    editingPO?.discount_type ?? 'flat'
  );
  const [charges, setCharges] = useState<ChargeRow[]>(
    editingPO?.charges?.map(c => ({
      description: c.description ?? '',
      amount: c.amount,
      category: c.category,
    })) ?? []
  );
  const [isLegacy, setIsLegacy] = useState(editingPO?.is_legacy ?? false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  /* ---------------- Item Rows ---------------- */
  const updateItem = (index: number, updated: PurchaseItem) => {
    const copy = [...items];
    copy[index] = updated;
    setItems(copy);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setItems([...items, { quantity: 1, unit_cost: 0 }]);
  };

  /* ---------------- Charge Rows ---------------- */
  const addCharge = () => {
    setCharges([...charges, { description: '', amount: 0, category: 'Shipping' }]);
  };

  const updateCharge = (index: number, patch: Partial<ChargeRow>) => {
    const copy = [...charges];
    copy[index] = { ...copy[index], ...patch };
    setCharges(copy);
  };

  const removeCharge = (index: number) => {
    setCharges(charges.filter((_, i) => i !== index));
  };

  /* ---------------- Inline Product Creation ---------------- */
  const createProduct = async (name: string, baseCost: number) => {
    return inventoryService.addProduct({
      name,
      cost_price: baseCost,
      sell_price: baseCost,
      stock: 0,
      has_variants: false,
    });
  };

  /* ---------------- Totals ---------------- */
  const goodsSubtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0);
  const discountValue =
    discountType === 'percent' ? goodsSubtotal * (Number(discount) / 100) : Number(discount);
  const chargesTotal = charges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const total = goodsSubtotal - discountValue + chargesTotal;

  /* ---------------- Save ---------------- */
  const handleSave = async (markAsPaid: boolean) => {
    if (!supplierId) {
      toast.warning('Please select a supplier');
      return;
    }
    if (items.length === 0) {
      toast.warning('Add at least one item');
      return;
    }
    if (isLegacy && items.some(i => !i.product_id)) {
      toast.warning('Legacy bills can only reference existing products');
      return;
    }
    const unpicked = items.some(i => !i.product_id && !i.product_name?.trim());
    if (unpicked) {
      toast.warning('Please select a product or enter a name for each item');
      return;
    }

    const payload = {
      supplier_id: supplierId,
      notes: notes.trim() || undefined,
      bill_date: billDate,
      discount: Number(discount) || 0,
      discount_type: discountType,
      is_legacy: isLegacy,
      items: items.map(i => ({
        product_id: i.product_id || undefined,
        product_name: i.product_id ? undefined : i.product_name,
        variant_id: i.variant_id ?? null,
        quantity: i.quantity,
        unit_cost: i.unit_cost,
      })),
      charges: charges
        .filter(c => Number(c.amount) > 0)
        .map(c => ({
          description: c.description.trim() || undefined,
          amount: Number(c.amount),
          category: c.category || 'Other',
        })),
    };

    setSaving(true);
    try {
      if (isEdit && editingPO) {
        await purchaseService.updatePO(editingPO.id, {
          ...payload,
          status: markAsPaid ? 'paid' : editingPO.status ?? 'unpaid',
        });
      } else {
        await purchaseService.createPO({
          ...payload,
          status: markAsPaid ? 'paid' : 'unpaid',
        });
      }
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error(isEdit ? 'Failed to update vendor bill' : 'Failed to create vendor bill');
    } finally {
      setSaving(false);
    }
  };

  const alreadyPaid = editingPO?.status === 'paid';

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? 'Edit Vendor Bill' : 'New Vendor Bill'}
      </h2>

      {/* Supplier + date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-gray-600">Supplier</label>
          <select
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Bill date</label>
          <input
            type="date"
            value={billDate}
            onChange={e => setBillDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Legacy toggle */}
      <label className="flex items-start gap-2 mb-5 p-3 bg-amber-50 border border-amber-100 rounded-lg cursor-pointer">
        <input
          type="checkbox"
          checked={isLegacy}
          onChange={e => setIsLegacy(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-amber-800">
          <span className="font-semibold">Legacy bill (documentation only)</span>
          <span className="block text-xs text-amber-700 mt-0.5">
            Records a past purchase for reference. Does <b>not</b> change stock or product
            cost, and cannot create new products. Charges still post to Expenses when paid.
          </span>
        </span>
      </label>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <PurchaseItemRow
            key={index}
            item={item}
            products={products}
            onChange={updated => updateItem(index, updated)}
            onRemove={() => removeItem(index)}
            onCreateProduct={createProduct}
            allowCreate={!isLegacy}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-4 flex items-center text-indigo-600 text-sm"
      >
        <Plus className="w-4 h-4 mr-1" /> Add item
      </button>

      {/* Discount */}
      <div className="mt-6 border-t pt-4">
        <label className="text-sm text-gray-600">Vendor discount</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="number"
            min={0}
            step="0.01"
            value={discount}
            onChange={e => setDiscount(Number(e.target.value) || 0)}
            className="w-40 border rounded px-3 py-2"
          />
          <div className="inline-flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setDiscountType('flat')}
              className={`px-3 py-2 text-sm ${discountType === 'flat' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
            >
              ₹
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={`px-3 py-2 text-sm ${discountType === 'percent' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
            >
              %
            </button>
          </div>
          <span className="text-xs text-gray-400">reduces cost of goods</span>
        </div>
      </div>

      {/* Additional charges */}
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Additional charges</label>
            <p className="text-xs text-gray-400">
              Shipping, packaging, etc. — each becomes an expense when the bill is marked paid.
            </p>
          </div>
          <button
            type="button"
            onClick={addCharge}
            className="flex items-center text-indigo-600 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add charge
          </button>
        </div>

        <div className="space-y-2 mt-3">
          {charges.map((c, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <input
                placeholder="Description (e.g. Courier)"
                value={c.description}
                onChange={e => updateCharge(index, { description: e.target.value })}
                className="col-span-5 border rounded px-2 py-1.5 text-sm"
              />
              <select
                value={c.category}
                onChange={e => updateCharge(index, { category: e.target.value })}
                className="col-span-3 border rounded px-2 py-1.5 text-sm"
              >
                {CHARGE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="₹"
                value={c.amount}
                onChange={e => updateCharge(index, { amount: Number(e.target.value) || 0 })}
                className="col-span-3 border rounded px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeCharge(index)}
                className="col-span-1 flex justify-center text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="text-sm text-gray-600">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="e.g. Invoice #123, payment terms..."
          className="w-full border rounded px-3 py-2 text-sm resize-none mt-1"
        />
      </div>

      {/* Totals breakdown */}
      <div className="mt-6 border-t pt-4 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Goods subtotal</span>
          <span className="tabular-nums">₹{goodsSubtotal.toFixed(2)}</span>
        </div>
        {discountValue > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Discount{discountType === 'percent' ? ` (${discount}%)` : ''}</span>
            <span className="tabular-nums text-emerald-600">−₹{discountValue.toFixed(2)}</span>
          </div>
        )}
        {chargesTotal > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Additional charges</span>
            <span className="tabular-nums">₹{chargesTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold text-gray-900 pt-1">
          <span>Total</span>
          <span className="tabular-nums">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3 mt-6 border-t pt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save (unpaid)'}
        </button>
        {!alreadyPaid && (
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white rounded flex items-center disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Save &amp; mark paid
          </button>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
