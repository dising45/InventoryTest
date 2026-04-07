/**
 * Generic CSV export utility
 * Converts an array of objects to a CSV file and triggers download
 */

interface ExportOptions {
  filename: string
  headers: { key: string; label: string }[]
  data: Record<string, any>[]
}

export function exportCSV({ filename, headers, data }: ExportOptions) {
  if (data.length === 0) {
    alert('No data to export.')
    return
  }

  // Build header row
  const headerRow = headers.map(h => `"${h.label}"`).join(',')

  // Build data rows
  const rows = data.map(row =>
    headers
      .map(h => {
        const val = row[h.key]
        if (val === null || val === undefined) return '""'
        // Escape double quotes
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      })
      .join(',')
  )

  const csvContent = [headerRow, ...rows].join('\n')

  // Create and trigger download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Format a number as INR currency string (without symbol for CSV)
 */
export function formatNumberForCSV(amount: number): string {
  return amount.toFixed(2)
}