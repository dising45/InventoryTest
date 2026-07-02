import React from 'react'
import { SalesOrder } from '../types'
import { Printer, X, Receipt } from 'lucide-react'

interface InvoiceModalProps {
  sale: SalesOrder | null
  onClose: () => void
}

const BUSINESS_NAME = 'Naitree'
const BUSINESS_TAGLINE = 'Tax Invoice'
const BUSINESS_PHONE = ''
const BUSINESS_EMAIL = ''
const BUSINESS_ADDRESS = ''

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getInvoiceNumber = (sale: SalesOrder) => {
  const year = new Date(sale.order_date || sale.created_at).getFullYear()
  return `INV-${year}-${sale.id.slice(0, 8).toUpperCase()}`
}

const getItemName = (item: any) => {
  const productName = item.product_name || item.product?.name || 'Product'
  const variantName = item.variant_name || item.variant?.name
  return variantName ? `${productName} (${variantName})` : productName
}

const getLineTotal = (item: any) =>
  Number(item.line_total ?? Number(item.quantity || 0) * Number(item.unit_price || 0))

const getSubtotal = (sale: SalesOrder) =>
  Number(
    sale.subtotal ??
      sale.items?.reduce((sum, item: any) => sum + getLineTotal(item), 0) ??
      sale.total_amount ??
      0
  )

const getDiscountAmount = (sale: SalesOrder, subtotal: number) => {
  const discount = Number(sale.discount || 0)
  if (!discount) return 0

  const type = sale.discount_type?.toLowerCase()
  if (type === 'percentage' || type === 'percent') {
    return (subtotal * discount) / 100
  }

  return discount
}

const getTaxAmount = (sale: SalesOrder, taxableAmount: number) => {
  const tax = Number(sale.tax || 0)
  if (!tax) return 0

  const type = sale.tax_type?.toLowerCase()
  if (type === 'percentage' || type === 'percent') {
    return (taxableAmount * tax) / 100
  }

  return tax
}

const getInvoiceHtml = (sale: SalesOrder) => {
  const subtotal = getSubtotal(sale)
  const discountAmount = getDiscountAmount(sale, subtotal)
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = getTaxAmount(sale, taxableAmount)
  const total = Number(sale.total_amount ?? taxableAmount + taxAmount)

  const rows = (sale.items || [])
    .map((item: any, index) => {
      const qty = Number(item.quantity || 0)
      const rate = Number(item.unit_price || 0)
      const amount = getLineTotal(item)

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${getItemName(item)}</td>
          <td class="num">${qty}</td>
          <td class="num">${formatCurrency(rate)}</td>
          <td class="num">${formatCurrency(amount)}</td>
        </tr>
      `
    })
    .join('')

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${getInvoiceNumber(sale)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #ffffff;
    }
    .invoice {
      max-width: 820px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #111827;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .business h1 {
      margin: 0;
      font-size: 30px;
      letter-spacing: -0.04em;
    }
    .business p, .meta p, .bill-to p {
      margin: 4px 0;
      color: #4b5563;
      font-size: 13px;
    }
    .meta {
      text-align: right;
    }
    .meta h2 {
      margin: 0 0 8px;
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 11px;
      color: #6b7280;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .bill-to {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
    }
    .bill-to h3 {
      margin: 0 0 4px;
      font-size: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid #d1d5db;
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    td {
      padding: 12px 10px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 13px;
      vertical-align: top;
    }
    .num {
      text-align: right;
      white-space: nowrap;
    }
    .totals {
      margin-left: auto;
      width: 320px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      color: #4b5563;
    }
    .grand-total {
      border-top: 2px solid #111827;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 900;
      color: #111827;
    }
    .footer {
      margin-top: 44px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .invoice { max-width: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="business">
        <h1>${BUSINESS_NAME}</h1>
        <p>${BUSINESS_TAGLINE}</p>
        ${BUSINESS_ADDRESS ? `<p>${BUSINESS_ADDRESS}</p>` : ''}
        ${BUSINESS_PHONE ? `<p>Phone: ${BUSINESS_PHONE}</p>` : ''}
        ${BUSINESS_EMAIL ? `<p>Email: ${BUSINESS_EMAIL}</p>` : ''}
      </div>
      <div class="meta">
        <h2>Invoice</h2>
        <p><strong>No:</strong> ${getInvoiceNumber(sale)}</p>
        <p><strong>Date:</strong> ${formatDate(sale.order_date || sale.created_at)}</p>
        <p><strong>Status:</strong> ${sale.status || 'Completed'}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Bill To</div>
      <div class="bill-to">
        <h3>${sale.customer?.name || 'Customer'}</h3>
        ${sale.customer?.phone ? `<p>Phone: ${sale.customer.phone}</p>` : ''}
        ${sale.customer?.email ? `<p>Email: ${sale.customer.email}</p>` : ''}
        ${sale.customer?.address ? `<p>${sale.customer.address}</p>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Items</div>
      <table>
        <thead>
          <tr>
            <th style="width: 48px;">#</th>
            <th>Item</th>
            <th class="num">Qty</th>
            <th class="num">Rate</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5">No items found</td></tr>'}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <strong>${formatCurrency(subtotal)}</strong>
        </div>
        ${
          discountAmount > 0
            ? `<div class="total-row"><span>Discount</span><strong>- ${formatCurrency(discountAmount)}</strong></div>`
            : ''
        }
        ${
          taxAmount > 0
            ? `<div class="total-row"><span>Tax</span><strong>${formatCurrency(taxAmount)}</strong></div>`
            : ''
        }
        <div class="total-row grand-total">
          <span>Total</span>
          <span>${formatCurrency(total)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      Thank you for your business.
    </div>
  </div>
  <script>
    window.onload = () => {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>
`
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
  if (!sale) return null

  const subtotal = getSubtotal(sale)
  const discountAmount = getDiscountAmount(sale, subtotal)
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = getTaxAmount(sale, taxableAmount)
  const total = Number(sale.total_amount ?? taxableAmount + taxAmount)

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=1100')
    if (!win) return

    win.document.open()
    win.document.write(getInvoiceHtml(sale))
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Invoice
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {getInvoiceNumber(sale)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="flex justify-between gap-6 border-b-2 border-gray-900 pb-5 mb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">
                  {BUSINESS_NAME}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{BUSINESS_TAGLINE}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Invoice
                </p>
                <p className="font-mono text-sm font-bold text-gray-900 mt-1">
                  {getInvoiceNumber(sale)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(sale.order_date || sale.created_at)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Bill To
              </p>
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <h3 className="font-bold text-gray-900">
                  {sale.customer?.name || 'Customer'}
                </h3>
                {sale.customer?.phone && (
                  <p className="text-sm text-gray-500 mt-1">Phone: {sale.customer.phone}</p>
                )}
                {sale.customer?.email && (
                  <p className="text-sm text-gray-500 mt-1">Email: {sale.customer.email}</p>
                )}
                {sale.customer?.address && (
                  <p className="text-sm text-gray-500 mt-1">{sale.customer.address}</p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] uppercase tracking-widest text-gray-400">
                    <th className="py-3 text-left font-black w-10">#</th>
                    <th className="py-3 text-left font-black">Item</th>
                    <th className="py-3 text-right font-black">Qty</th>
                    <th className="py-3 text-right font-black">Rate</th>
                    <th className="py-3 text-right font-black">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(sale.items || []).map((item: any, index) => (
                    <tr key={item.id || index}>
                      <td className="py-3 text-gray-400">{index + 1}</td>
                      <td className="py-3 font-medium text-gray-900">
                        {getItemName(item)}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {Number(item.quantity || 0)}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {formatCurrency(Number(item.unit_price || 0))}
                      </td>
                      <td className="py-3 text-right font-bold tabular-nums">
                        {formatCurrency(getLineTotal(item))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 ml-auto max-w-sm space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Discount</span>
                  <span className="font-bold text-gray-900">- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span className="font-bold text-gray-900">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-gray-900 pt-3 text-lg font-black text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-10 pt-4 border-t border-gray-100">
              Thank you for your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceModal