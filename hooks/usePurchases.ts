import { useState, useEffect, useCallback } from 'react'
import { purchaseService } from '../services/purchaseService.supabase'

export function usePurchases() {
  const [purchaseOrders, setPOs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPOs(await purchaseService.getPOs())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const savePO = async (data: Parameters<typeof purchaseService.createPO>[0]) => {
    await purchaseService.createPO(data)
    await load()
  }

  const deletePO = async (id: string) => {
    await purchaseService.deletePO(id)
    await load()
  }

  return { purchaseOrders, loading, savePO, deletePO, reload: load }
}
