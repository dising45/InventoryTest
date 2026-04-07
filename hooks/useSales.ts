import { useState, useEffect, useCallback } from 'react'
import { SalesOrder, SalesItem } from '../types'
import { salesService } from '../services/salesService.supabase'

export interface SalePayload {
  customer_id: string
  items: SalesItem[]
  total_amount: number
  order_date: string
  subtotal?: number
  discount?: number
  discount_type?: 'flat' | 'percentage'
  tax?: number
  tax_type?: 'flat' | 'percentage'
}

export function useSales() {
  const [sales, setSales] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSales(await salesService.getSales())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveSale = async (data: SalePayload, editId?: string) => {
    if (editId) {
      await salesService.updateSale(editId, data)
    } else {
      await salesService.createSale(data)
    }
    await load()
  }

  const deleteSale = async (id: string) => {
    await salesService.deleteSale(id)
    await load()
  }

  const updateStatus = async (id: string, status: string) => {
    await salesService.updateStatus(id, status)
    await load()
  }

  return { sales, loading, reload: load, saveSale, deleteSale, updateStatus }
}