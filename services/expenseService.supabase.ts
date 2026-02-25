import { supabase } from './supabaseClient'
import { Expense } from '../types'

class ExpenseServiceSupabase {
  /* ===============================
     GET ALL EXPENSES
     =============================== */
  // async getExpenses(): Promise<Expense[]> {
  //   const { data, error } = await supabase
  //     .from('expenses')
  //     .select('*')
  //     .order('expense_date', { ascending: false })

  //   if (error) {
  //     console.error('GET EXPENSES FAILED', error)
  //     throw error
  //   }

  //   return (data ?? []) as Expense[]
  // }
  async getExpenses(options?: {
    from?: string
    to?: string
    vendor?: string
    category?: string
    search?: string
    sortBy?: 'expense_date' | 'amount' | 'vendor' | 'category'
    sortOrder?: 'asc' | 'desc'
  }) {
    let query = supabase.from('expenses').select('*')

    if (options?.from)
      query = query.gte('expense_date', options.from)

    if (options?.to)
      query = query.lte('expense_date', options.to)

    if (options?.vendor)
      query = query.eq('vendor', options.vendor)

    if (options?.category)
      query = query.eq('category', options.category)

    if (options?.search)
      query = query.ilike('description', `%${options.search}%`)

    if (options?.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.sortOrder === 'asc',
      })
    } else {
      query = query.order('expense_date', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('GET EXPENSES FAILED', error)
      throw error
    }

    return data ?? []
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
