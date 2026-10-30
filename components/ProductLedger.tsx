import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Product, PurchaseOrder, SalesOrder } from '../types'
import {
  Search, X, BookOpen, Package, ShoppingCart,
  TrendingUp, TrendingDown, AlertCircle,
} from 'lucide-react'

interface Props {
  products: Product[]
  purchaseOrders: PurchaseOrder[]
  sales: SalesOrder[]
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v)

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'

const saleStatusCls = (status: string) => {
  const map: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700',
    Confirmed: 'bg-blue-50 text-blue-700',
    Shipped: 'bg-purple-50 text-purple-700',
    Pending: 'bg-amber-50 text-amber-700',
    'Awaiting Payment': 'bg-orange-50 text-orange-700',
    Cancelled: 'bg-red-50 text-red-500',
  }
  return map[status] ?? 'bg-gray-50 text-gray-600'
}

// ─── summary card ─────────────────────────────────────────────────────────────

interface CardProps {
  label: string
  value: string
  unit?: string
  sub?: string
  color: 'indigo' | 'emerald' | 'rose' | 'amber'
  icon: React.ReactNode
}

const colorMap: Record<CardProps['color'], string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-500',
  amber: 'bg-amber-50 text-amber-600',
}

const SummaryCard: React.FC<CardProps> = ({ label, value, unit, sub, color, icon }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>{icon}</div>
    </div>
    <p className="text-xl font-bold text-gray-900">
      {value}
      {unit && <span className="text-sm font-medium text-gray-400 ml-1">{unit}</span>}
    </p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
)

// ─── main component ───────────────────────────────────────────────────────────

const ProductLedger: React.FC<Props> = ({ products, purchaseOrders, sales }) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── product search dropdown ──
  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products
      .filter(p => p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q))
      .slice(0, 15)
  }, [products, query])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSelect = (p: Product) => {
    setSelected(p)
    setQuery('')
    setIsOpen(false)
  }

  // ── purchase rows for selected product ──
  const purchaseRows = useMemo(() => {
    if (!selected) return []
    return purchaseOrders
      .flatMap(po =>
        (po.items ?? [])
          .filter(i => i.product_id === selected.id)
          .map(i => ({ po, item: i }))
      )
      .sort((a, b) =>
        new Date(b.po.bill_date ?? b.po.created_at).getTime() -
        new Date(a.po.bill_date ?? a.po.created_at).getTime()
      )
  }, [selected, purchaseOrders])

  // ── sale rows for selected product ──
  const saleRows = useMemo(() => {
    if (!selected) return []
    return sales
      .flatMap(order =>
        (order.items ?? [])
          .filter(i => i.product_id === selected.id)
          .map(i => ({ order, item: i }))
      )
      .sort((a, b) =>
        new Date(b.order.order_date ?? b.order.created_at).getTime() -
        new Date(a.order.order_date ?? a.order.created_at).getTime()
      )
  }, [selected, sales])

  // ── stats ──
  const totalIn = purchaseRows.reduce((s, r) => s + r.item.quantity, 0)
  const activeSaleRows = saleRows.filter(r => r.order.status !== 'Cancelled')
  const totalOut = activeSaleRows.reduce((s, r) => s + r.item.quantity, 0)
  const avgCost = totalIn > 0
    ? purchaseRows.reduce((s, r) => s + r.item.unit_cost * r.item.quantity, 0) / totalIn
    : null
  const avgSell = totalOut > 0
    ? activeSaleRows.reduce((s, r) => s + r.item.unit_price * r.item.quantity, 0) / totalOut
    : null

  const hasVariants = selected?.has_variants ?? false

  return (
    <div className="space-y-5">
      {/* ── Product search / selected chip ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {selected ? (
          <div className="flex items-center gap-3">
            {selected.image_url ? (
              <img
                src={selected.image_url}
                alt=""
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                {selected.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{selected.name}</p>
              <p className="text-xs text-gray-500">
                <span className="font-mono">{selected.sku ?? 'No SKU'}</span>
                {hasVariants && (
                  <span className="ml-2 text-indigo-600 font-medium">· Variant product</span>
                )}
              </p>
            </div>
            <button
              onClick={() => { setSelected(null); setQuery('') }}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div ref={containerRef} className="relative">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setIsOpen(true) }}
                onFocus={() => query && setIsOpen(true)}
                placeholder="Search by product name or SKU (e.g. NTR-0092)…"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            </div>
            {isOpen && filtered.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 max-h-64 overflow-y-auto">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 text-left border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] font-mono text-gray-400">{p.sku ?? 'No SKU'}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {p.stock}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {!selected && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-500 mb-1">Select a product to view its ledger</p>
          <p className="text-sm text-gray-400">See every purchase bill and sale in one place</p>
        </div>
      )}

      {selected && (
        <>
          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              label="Current Stock"
              value={String(selected.stock)}
              unit="units"
              color="indigo"
              icon={<Package className="w-4 h-4" />}
            />
            <SummaryCard
              label="Total Purchased"
              value={String(totalIn)}
              unit="units"
              color="emerald"
              icon={<TrendingUp className="w-4 h-4" />}
              sub={avgCost !== null ? `avg ${fmt(avgCost)}` : 'no bill history'}
            />
            <SummaryCard
              label="Total Sold"
              value={String(totalOut)}
              unit="units"
              color="rose"
              icon={<TrendingDown className="w-4 h-4" />}
              sub={avgSell !== null ? `avg ${fmt(avgSell)}` : '—'}
            />
            <SummaryCard
              label="Sell Price"
              value={fmt(selected.sell_price)}
              color="amber"
              icon={<ShoppingCart className="w-4 h-4" />}
              sub={selected.cost_price ? `cost ${fmt(selected.cost_price)}` : undefined}
            />
          </div>

          {/* ── No purchase history notice ── */}
          {purchaseRows.length === 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <p>No purchase bills recorded for this product — initial stock was set manually when the product was created.</p>
            </div>
          )}

          {/* ── Purchases table ── */}
          {purchaseRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">Purchased From</h3>
                <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {totalIn} units
                </span>
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Bill #</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Supplier</th>
                      {hasVariants && (
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Variant</th>
                      )}
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Unit Cost</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Total</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {purchaseRows.map(({ po, item }, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                          {fmtDate(po.bill_date ?? po.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            #{po.id.slice(0, 6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {po.supplier?.name ?? '—'}
                        </td>
                        {hasVariants && (
                          <td className="px-4 py-3 text-gray-600">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(item as any).variant?.name ?? '—'}
                          </td>
                        )}
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{fmt(item.unit_cost)}</td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">
                          {fmt(item.unit_cost * item.quantity)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            po.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}>
                            {po.status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-50">
                {purchaseRows.map(({ po, item }, idx) => (
                  <div key={item.id ?? idx} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          #{po.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          po.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {po.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {po.supplier?.name ?? '—'}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {hasVariants && (item as any).variant?.name && (
                          <span className="text-gray-500 font-normal">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {' '}· {(item as any).variant.name}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{fmtDate(po.bill_date ?? po.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">{item.quantity} units</p>
                      <p className="text-xs text-gray-500">{fmt(item.unit_cost)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sales table ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-gray-900 text-sm">Sold To</h3>
              <span className="ml-auto text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {totalOut} units
              </span>
            </div>

            {saleRows.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-center">
                <ShoppingCart className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No sales recorded yet</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Order #</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Customer</th>
                        {hasVariants && (
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Variant</th>
                        )}
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Qty</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Unit Price</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Total</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {saleRows.map(({ order, item }, idx) => (
                        <tr
                          key={item.id ?? idx}
                          className={`hover:bg-gray-50/50 transition-colors ${
                            order.status === 'Cancelled' ? 'opacity-50' : ''
                          }`}
                        >
                          <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                            {fmtDate(order.order_date ?? order.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {order.customer?.name ?? '—'}
                          </td>
                          {hasVariants && (
                            <td className="px-4 py-3 text-gray-600">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {(item as any).variant?.name ?? '—'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-right font-bold text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {item.unit_price === 0 ? (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                FREE
                              </span>
                            ) : (
                              fmt(item.unit_price)
                            )}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-gray-900">
                            {item.unit_price === 0 ? '—' : fmt(item.unit_price * item.quantity)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${saleStatusCls(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-50">
                  {saleRows.map(({ order, item }, idx) => (
                    <div
                      key={item.id ?? idx}
                      className={`px-4 py-3 flex items-start gap-3 ${
                        order.status === 'Cancelled' ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${saleStatusCls(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.customer?.name ?? '—'}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {hasVariants && (item as any).variant?.name && (
                            <span className="text-gray-500 font-normal">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {' '}· {(item as any).variant.name}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{fmtDate(order.order_date ?? order.created_at)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">{item.quantity} units</p>
                        <p className="text-xs text-gray-500">
                          {item.unit_price === 0 ? 'FREE' : `${fmt(item.unit_price)} each`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductLedger
