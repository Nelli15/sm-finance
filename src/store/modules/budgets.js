// import firebase from '../../scripts/firebase'
import { getFirestore, onSnapshot, collection, query, where } from 'firebase/firestore'
// import Vue from 'vue'

const state = {
  budgetCategories: {},
  budgets: {},
  accounts: {},
  tableKey: 0,
  accountsLoading: false,
  catLoading: false,
  budgetsLoading: false,
  loading: false,
  listeners: []
}

export const getters = {
  budgetCategories: state => state.budgetCategories,
  budgets: state => state.budgets,
  accounts: state => state.accounts,
  tableKey: state => state.tableKey,
  budgetOptions: state => {
    let result = {},
      budgetOptions = []
    Object.assign(result, state.accounts, state.budgets)
    for (var key in result) {
      budgetOptions.push(result[key])
    }
    return budgetOptions.sort((a, b) => (a.label > b.label ? 1 : -1))
  },
  budgetsArray: state => {
    let result = {},
      budgetOptions = []
    Object.assign(result, state.budgets)
    for (var key in result) {
      budgetOptions.push(result[key])
    }
    return budgetOptions.sort((a, b) => (a.label > b.label ? 1 : -1))
  },
  budgetCategoryOptions: state => {
    let result = {},
      budgetOptions = []
    Object.assign(result, state.budgetCategories)
    for (var key in result) {
      budgetOptions.push(result[key])
    }
    return budgetOptions.sort((a, b) => (a.label > b.label ? 1 : -1))
  },
  headerAccounts: state => {
    let accounts = []
    for (var key in state.accounts) {
      if (state.accounts[key].inHeader === true) {
        accounts.push(state.accounts[key])
      }
    }
    return accounts.sort((a, b) => (a.label > b.label ? 1 : -1))
  },
  loading: state =>
    state.loading ||
    state.accountsLoading ||
    state.catLoading ||
    state.budgetsLoading
}

export const mutations = {
  setBudgetCategories(state, payload) {
    state.budgetCategories = payload
  },
  setBudgets(state, payload) {
    state.budgets = payload
  },
  setAccounts(state, payload) {
    state.accounts = payload
  },
  populateBudgets(state, rootState) {
    // console.log(rootState)
    let transaction = {}
    // console.log(Object.keys(state.budgets).length)
    if (
      Object.keys(state.accounts).length > 0 &&
      Object.keys(state.budgets).length > 0 &&
      Object.keys(state.budgetCategories).length > 0
    ) {
      state.loading = true
      let key

      // reset the calculated values of the budgets
      for (key in state.budgetCategories) {
        // state.budgetCategories[key].expenses = state.budgetCategories[key].expenses ? state.budgetCategories[key].expenses : 0
        // state.budgetCategories[key].income = state.budgetCategories[key].income ? state.budgetCategories[key].income : 0
        // state.budgetCategories[key].budget = 0
        state.budgetCategories[key].inUse = false
        state.budgetCategories[key].transAwaitingReview = 0
      }
      for (key in state.budgets) {
        // state.budgets[key].expenses = state.budgets[key].expenses ? state.budgets[key].expenses : 0
        // state.budgets[key].income = state.budgets[key].income ? state.budgets[key].income : 0
        // state.budgets[key].inUse = false
        // console.log(state.budgetCategories[state.budgets[key].category])
        if (state.budgetCategories[state.budgets[key].category]) {
          state.budgetCategories[state.budgets[key].category].inUse = true
          state.budgetCategories[
            state.budgets[key].category
          ].transAwaitingReview =
            parseInt(
              state.budgetCategories[state.budgets[key].category]
                .transAwaitingReview
            ) +
            (state.budgets[key].transAwaitingReview
              ? parseInt(state.budgets[key].transAwaitingReview)
              : 0)
          // state.budgetCategories[state.budgets[key].category].budget += state.budgets[key].budget ? parseFloat(state.budgets[key].budget) : 0
        }
      }
      for (key in state.accounts) {
        // state.accounts[key].expenses = state.accounts[key].expenses ? state.accounts[key].expenses : 0
        // state.accounts[key].income = state.accounts[key].income ? state.accounts[key].income : 0
        state.accounts[key].inUse = false
      }
      // loop through all the transactions categorising and creating totals
      for (var transKey in rootState.transactions.transactions) {
        transaction = rootState.transactions.transactions[transKey]
        if (transaction.deleted === false) {
          if (transaction.category === 'Expense') {
            // calulate the expense transactions
            if (state.accounts[transaction.budget]) {
              state.accounts[transaction.budget].inUse = true
              // state.accounts[transaction.budget].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.budget].inUse = true
              state.budgetCategories[
                state.budgets[transaction.budget].category
              ].inUse = true
              // state.budgets[transaction.budget].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              // state.budgetCategories[state.budgets[transaction.budget].category].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
          } else if (transaction.category === 'Income') {
            // calculate the income transactions
            if (state.accounts[transaction.budget]) {
              state.accounts[transaction.budget].inUse = true
              // state.accounts[transaction.budget].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.budget].inUse = true
              state.budgetCategories[
                state.budgets[transaction.budget].category
              ].inUse = true
              // state.budgets[transaction.budget].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              // state.budgetCategories[state.budgets[transaction.budget].category].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
          } else if (transaction.category === 'Journal') {
            // calculate the journalled transactions
            // console.log(transaction, state.accounts, state.accounts[transaction.from], state.accounts[transaction.to])
            if (state.accounts[transaction.from]) {
              state.accounts[transaction.from].inUse = true
              // state.accounts[transaction.from].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.from].inUse = true
              state.budgetCategories[
                state.budgets[transaction.from].category
              ].inUse = true
              // state.budgets[transaction.from].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              // state.budgetCategories[state.budgets[transaction.from].category].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
            if (state.accounts[transaction.to]) {
              state.accounts[transaction.to].inUse = true
              // state.accounts[transaction.to].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.to].inUse = true
              state.budgetCategories[
                state.budgets[transaction.to].category
              ].inUse = true
              // state.budgets[transaction.to].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              // state.budgetCategories[state.budgets[transaction.to].category].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
          }
        }
      }
      // for (var budgetKey in state.budgets) {
      //   // console.log(budgetKey)
      //   state.budgetCategories[state.budgets[budgetKey].category].budget += parseFloat(state.budgets[budgetKey].budget) ? parseFloat(state.budgets[budgetKey].budget) : 0
      //   // console.log(state.budgetCategories[state.budgets[budgetKey].category].budget)
      // }
      state.tableKey += 1
      state.loading = false
    }
  },
  setBudgetKey(state, payload) {
    state.budgets[payload.budgetId][payload.key] = payload.val
  },
  setCategoryKey(state, payload) {
    state.budgetCategories[payload.budgetId][payload.key] = payload.val
  },
  setAccountKey(state, payload) {
    state.accounts[payload.accountId][payload.key] = payload.val
  },
  setAccountsLoading(state, payload) {
    state.accountsLoading = payload
  },
  setCatLoading(state, payload) {
    state.catLoading = payload
  },
  setBudgetsLoading(state, payload) {
    state.budgetsLoading = payload
  },
  addListeners(state, unsub) {
    state.listeners.push(unsub)
  },
  clearListeners(state, {}) {
    
    // for(let unsub of state.listeners){
    //   unsub()
    // }
    // state.listeners = []
  }
}

export const actions = {
  fetchBudgetCategories({ commit, dispatch }, payload) {
    // console.log('Fetch Budget Categories', payload)
    commit('setCatLoading', true)

    // commit('clearListeners', false)
      let unsub = onSnapshot(query(collection(getFirestore(), `/projects/${payload}/accounts`), where('type', '==', 'category')), async categoriesSnap => {
        commit('setCatLoading', true)
        // console.log('Fetch Budget Categories')
        let budgets = {},
          budget = {}
        let promises = categoriesSnap.docs.map(doc => {
          budget = doc.data()
          budget.id = doc.id
          budget.expenses = budget.expenses ? parseFloat(budget.expenses) : 0
          budget.income = budget.income ? parseFloat(budget.income) : 0
          budget.budget = budget.budget ? parseFloat(budget.budget) : 0
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgetCategories', budgets)
        dispatch('fetchPopulateBudgets')
        commit('setCatLoading', false)

        // dispatch('fetchPopulateBudgets')
      })
      commit('addListeners', unsub)
  },
  fetchBudgets({ commit, dispatch }, payload) {
    // console.log('Fetch Budgets', payload)
    commit('setBudgetsLoading', true)
      // commit('clearListeners', false)
      let unsub = onSnapshot(query(collection(getFirestore(), `/projects/${payload}/accounts`), where('type', '==', 'budget')),async budgetsSnap => {
        commit('setBudgetsLoading', true)

        // console.log('Fetch Budgets')
        let budgets = {},
          budget = {}
        let promises = budgetsSnap.docs.map(doc => {
          budget = doc.data()
          budget.id = doc.id
          budget.budget = budget.budget ? parseFloat(budget.budget) : 0
          budget.expenses = budget.expenses ? parseFloat(budget.expenses) : 0
          // console.log(budget.id, budget.expenses)
          budget.income = budget.income ? parseFloat(budget.income) : 0
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgets', budgets)
        dispatch('fetchPopulateBudgets')
        commit('setBudgetsLoading', false)
      })
      commit('addListeners', unsub)
  },
  fetchAccounts({ commit, dispatch }, payload) {
    // console.log('Fetch Budgets', payload)
    commit('setAccountsLoading', true)
      // commit('clearListeners', false)
      let unsub = onSnapshot(query(collection(getFirestore(), `/projects/${payload}/accounts`), where('type', '==', 'account')), async accountsSnap => {
        commit('setAccountsLoading', true)

        console.log('Fetch accounts')
        let accounts = {},
          account = {}
        let promises = accountsSnap.docs.map(doc => {
          account = doc.data()
          account.id = doc.id
          account.expenses = account.expenses ? parseFloat(account.expenses) : 0
          account.income = account.income ? parseFloat(account.income) : 0
          accounts[account.id] = account
        })
        await Promise.all(promises)
        commit('setAccounts', accounts)
        dispatch('fetchPopulateBudgets')
        commit('setAccountsLoading', false)
      })
      commit('addListeners', unsub)
  },
  fetchPopulateBudgets({ rootState, commit }) {
    commit('populateBudgets', rootState)
  },
  updateBudgetByKey({ commit }, payload) {
    commit('setBudgetKey', payload)
  },
  updateCategoryByKey({ commit }, payload) {
    commit('setCategoryKey', payload)
  },
  updateAccountByKey({ commit }, payload) {
    commit('setAccountKey', payload)
  }
}
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
