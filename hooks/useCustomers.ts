import { useState, useEffect, useCallback } from 'react'
import { Customer } from '../types'
import { customerService } from '../services/customerService.supabase'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCustomers(await customerService.getCustomers())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveCustomer = async (data: Omit<Customer, 'id'>, editId?: string) => {
    if (editId) {
      await customerService.updateCustomer(editId, data)
    } else {
      await customerService.addCustomer(data)
    }
    await load()
  }

  const deleteCustomer = async (id: string) => {
    await customerService.deleteCustomer(id)
    await load()
  }

  return { customers, loading, reload: load, saveCustomer, deleteCustomer }
}