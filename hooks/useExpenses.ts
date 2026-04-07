import { useState, useEffect, useCallback } from 'react'
import { Expense } from '../types'
import { expenseService } from '../services/expenseService.supabase'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setExpenses(await expenseService.getExpenses())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveExpense = async (data: Omit<Expense, 'id' | 'created_at'>, editId?: string) => {
    if (editId) {
      await expenseService.updateExpense(editId, data)
    } else {
      await expenseService.addExpense(data)
    }
    await load()
  }

  const deleteExpense = async (id: string) => {
    await expenseService.deleteExpense(id)
    await load()
  }

  return { expenses, loading, reload: load, saveExpense, deleteExpense }
}