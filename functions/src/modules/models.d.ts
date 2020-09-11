export interface AccountDoc {
  category: string
  label: string
  type: 'budget' | 'category' | 'account'
  expenses: number
  income: number
  budget: number
}
