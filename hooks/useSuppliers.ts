import { useState, useEffect, useCallback } from 'react'
import { Supplier } from '../types'
import { supplierService } from '../services/supplierService.supabase'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSuppliers(await supplierService.getSuppliers())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveSupplier = async (data: Omit<Supplier, 'id'>, editId?: string) => {
    if (editId) {
      await supplierService.updateSupplier(editId, data)
    } else {
      await supplierService.addSupplier(data)
    }
    await load()
  }

  const deleteSupplier = async (id: string) => {
    await supplierService.deleteSupplier(id)
    await load()
  }

  return { suppliers, loading, reload: load, saveSupplier, deleteSupplier }
}