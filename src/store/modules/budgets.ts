// import firebase from '../../scripts/firebase'
import { getFirestore, onSnapshot, collection, query, where } from 'firebase/firestore'
import currency from 'currency.js'
import { Commit, Dispatch } from 'vuex'
import { Transaction, TransactionList } from 'src/services/transaction'
interface BudgetCategory{
  id: string
  budget: currency
  expenses: currency
  balance: currency
  label: string
  inUse: boolean
  transAwaitingReview: number
  [key: string]: any
}
interface Budget{
  id: string
  budget: currency
  expenses: currency
  balance: currency
  label: string
  inUse: boolean
  transAwaitingReview: number
  category: string
  [key: string]: any
}
interface Account{
  id: string
  budget: currency
  expenses: currency
  balance: currency
  inHeader: boolean
  label: string
  inUse: boolean
  transAwaitingReview: number
  [key: string]: any
}

interface State{
  budgetCategories: Record<BudgetCategory['id'], BudgetCategory>,
  budgets: Record<Budget['id'], Budget>,
  accounts: Record<Account['id'], Account>,
}

const state = {
  budgetCategories: {},
  budgets: {},
  accounts: {},
}

export const getters = {
  budgetCategories: (state: State) => state.budgetCategories,
  budgets: (state: State) => state.budgets,
  accounts: (state: State) => state.accounts,
  budgetOptions: (state: State) => {
    let result: Record<Budget['id'], Budget> | Record<Account['id'], Account> = {}
    Object.assign(result, state.accounts, state.budgets)
    return Object.values(result).sort((a, b) => (a.label > b.label ? 1 : -1))
  },
  budgetsArray: (state: State) => Object.values(state.budgets).sort((a, b) => (a.label > b.label ? 1 : -1)),
  budgetCategoryOptions: (state: State) => Object.values(state.budgetCategories).sort((a, b) => (a.label > b.label ? 1 : -1)),
  headerAccounts: (state: State) => {
    let accounts = []
    for (var key in state.accounts) {
      if (state.accounts[key].inHeader === true) {
        accounts.push(state.accounts[key])
      }
    }
    return accounts.sort((a, b) => (a.label > b.label ? 1 : -1))
  }
}

export const mutations = {
  setBudgetCategories(state: State, categories: Record<BudgetCategory['id'], BudgetCategory>) {
    state.budgetCategories = categories
  },
  setBudgets(state: State, budgets: Record<Budget['id'], Budget>) {
    state.budgets = budgets
  },
  setAccounts(state: State, accounts: Record<Account['id'], Account>) {
    state.accounts = accounts
  },
  populateBudgets(state: State, rootState: any) {
    let transaction: Transaction
    if (
      Object.keys(state.accounts).length > 0 &&
      Object.keys(state.budgets).length > 0 &&
      Object.keys(state.budgetCategories).length > 0
    ) {
      let key: string

      // reset the calculated values of the budgets
      for (key in state.budgetCategories) {
        state.budgetCategories[key].inUse = false
        state.budgetCategories[key].transAwaitingReview = 0
      }
      for (key in state.budgets) {
        if (state.budgetCategories[state.budgets[key].category]) {
          state.budgetCategories[state.budgets[key].category].inUse = true
          state.budgetCategories[
            state.budgets[key].category
          ].transAwaitingReview =
            state.budgetCategories[state.budgets[key].category]
                .transAwaitingReview
             +
            (state.budgets[key].transAwaitingReview
              ? state.budgets[key].transAwaitingReview
              : 0)
          // state.budgetCategories[state.budgets[key].category].budget += state.budgets[key].budget ? currency(state.budgets[key].budget) : currency(0)
        }
      }
      for (key in state.accounts) {
        state.accounts[key].inUse = false
      }
      // loop through all the transactions categorising and creating totals
      for (var transKey in rootState.transactions.transactions) {
        transaction = rootState.transactions.transactions[transKey]
        if (transaction.deleted === false) {
          if (transaction.category === 'Expense') {
            // calulate the expense transactions
            if (transaction.budget && state.accounts[transaction.budget]) {
              state.accounts[transaction.budget].inUse = true
              // state.accounts[transaction.budget].expenses += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            } else if (transaction.budget){
              state.budgets[transaction.budget].inUse = true
              state.budgetCategories[
                state.budgets[transaction.budget].category
              ].inUse = true
              // state.budgets[transaction.budget].expenses += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
              // state.budgetCategories[state.budgets[transaction.budget].category].expenses += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            }
          } else if (transaction.category === 'Income') {
            // calculate the income transactions
            if (transaction.budget && state.accounts[transaction.budget]) {
              state.accounts[transaction.budget].inUse = true
              // state.accounts[transaction.budget].income += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            }  else if (transaction.budget){
              state.budgets[transaction.budget].inUse = true
              state.budgetCategories[
                state.budgets[transaction.budget].category
              ].inUse = true
              // state.budgets[transaction.budget].income += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
              // state.budgetCategories[state.budgets[transaction.budget].category].income += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            }
          } else if (transaction.category === 'Journal') {
            // calculate the journalled transactions
            // console.log(transaction, state.accounts, state.accounts[transaction.from], state.accounts[transaction.to])
            if (transaction.from && state.accounts[transaction.from]) {
              state.accounts[transaction.from].inUse = true
              // state.accounts[transaction.from].expenses += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            } else if(transaction.from) {
              state.budgets[transaction.from].inUse = true
              state.budgetCategories[
                state.budgets[transaction.from].category
              ].inUse = true
              // state.budgets[transaction.from].expenses += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
              // state.budgetCategories[state.budgets[transaction.from].category].expenses += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            }
            if (transaction.to && state.accounts[transaction.to]) {
              state.accounts[transaction.to].inUse = true
              // state.accounts[transaction.to].income += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            } else if (transaction.to){
              state.budgets[transaction.to].inUse = true
              state.budgetCategories[
                state.budgets[transaction.to].category
              ].inUse = true
              // state.budgets[transaction.to].income += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
              // state.budgetCategories[state.budgets[transaction.to].category].income += currency(transaction.amount) ? currency(transaction.amount) : currency(0)
            }
          }
        }
      }
    }
  },
  setBudgetKey(state: State, { budgetId, key, val}: { budgetId: string, key: string, val: any}) {
    state.budgets[budgetId][key] = val
  },
  setCategoryKey(state: State, { budgetId, key, val}: { budgetId: string, key: string, val: any}) {
    state.budgetCategories[budgetId][key] = val
  },
  setAccountKey(state: State, { accountId, key, val}: { accountId: string, key: string, val: any}) {
    state.accounts[accountId][key] = val
  }
}

export const actions = {
  fetchBudgetCategories({ commit, dispatch }: { commit: Commit, dispatch: Dispatch}, projectId: string) {
      let unsub = onSnapshot(query(collection(getFirestore(), `/projects/${projectId}/accounts`), where('type', '==', 'category')), async categoriesSnap => {
        let budgets: Record<BudgetCategory['id'], BudgetCategory> = {}
        let promises = categoriesSnap.docs.map((doc: any) => {
          let budget = doc.data()
          budget.id = doc.id
          budget.balance = budget.balance ? currency(budget.balance) : currency(0)
          budget.expenses = budget.expenses ? currency(budget.expenses) : currency(0)
          budget.income = budget.income ? currency(budget.income) : currency(0)
          budget.budget = budget.budget ? currency(budget.budget) : currency(0)
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgetCategories', budgets)
        dispatch('fetchPopulateBudgets')
      })
  },
  fetchBudgets({ commit, dispatch }: { commit: Commit, dispatch: Dispatch}, projectId: string) {
      let unsub = onSnapshot(query(collection(getFirestore(), `/projects/${projectId}/accounts`), where('type', '==', 'budget')),async budgetsSnap => {
        let budgets: Record<Budget['id'], Budget> = {},
          budget: Budget
        let promises = budgetsSnap.docs.map((doc: any) => {
          budget = doc.data()
          budget.id = doc.id
          budget.balance = budget.balance ? currency(budget.balance) : currency(0)
          budget.budget = budget.budget ? currency(budget.budget) : currency(0)
          budget.expenses = budget.expenses ? currency(budget.expenses) : currency(0)
          budget.income = budget.income ? currency(budget.income) : currency(0)
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgets', budgets)
        dispatch('fetchPopulateBudgets')
      })
  },
  fetchAccounts({ commit, dispatch }: { commit: Commit, dispatch: Dispatch}, projectId: string) {
      let unsub = onSnapshot(query(collection(getFirestore(), `/projects/${projectId}/accounts`), where('type', '==', 'account')), async accountsSnap => {
        let accounts: Record<Account['id'], Account> = {},
          account: Account
        let promises = accountsSnap.docs.map((doc: any) => {
          account = doc.data()
          account.id = doc.id
          account.balance = account.balance ? currency(account.balance) : currency(0)
          account.expenses = account.expenses ? currency(account.expenses) : currency(0)
          account.income = account.income ? currency(account.income) : currency(0)
          accounts[account.id] = account
        })
        await Promise.all(promises)
        commit('setAccounts', accounts)
        dispatch('fetchPopulateBudgets')
      })
  },
  fetchPopulateBudgets({ rootState, commit }: { commit: Commit, rootState: any}) {
    commit('populateBudgets', rootState)
  },
  updateBudgetByKey({ commit }: { commit: Commit}, { budgetId, key, val}: { budgetId: string, key: string, val: any}) {
    commit('setBudgetKey', { budgetId, key, val})
  },
  updateCategoryByKey({ commit }: { commit: Commit}, { budgetId, key, val}: { budgetId: string, key: string, val: any}) {
    commit('setCategoryKey', { budgetId, key, val})
  },
  updateAccountByKey({ commit }: { commit: Commit}, { accountId, key, val}: { accountId: string, key: string, val: any}) {
    commit('setAccountKey', { accountId, key, val})
  }
}
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
