import { supabase } from './supabaseClient'
import { Expense } from '../types'

class ExpenseServiceSupabase {
  /* ===============================
     GET ALL EXPENSES
     =============================== */
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })

    if (error) {
      console.error('GET EXPENSES FAILED', error)
      throw error
    }

    return (data ?? []) as Expense[]
  }

  /* ===============================
     CREATE EXPENSE
     =============================== */
  async addExpense(expense: {
    expense_date: string
    category: string
    description?: string
    amount: number
    payment_mode?: string
    reference?: string
    vendor?: string
  }) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          expense_date: expense.expense_date,
          category: expense.category,
          description: expense.description ?? null,
          amount: Number(expense.amount),
          payment_mode: expense.payment_mode ?? null,
          reference: expense.reference ?? null,
          vendor: expense.vendor ?? null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('ADD EXPENSE FAILED', error)
      throw error
    }

    return data
  }

  /* ===============================
     DELETE EXPENSE
     =============================== */
  async deleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('DELETE EXPENSE FAILED', error)
      throw error
    }

    return true
  }
}

export const expenseService = new ExpenseServiceSupabase()
