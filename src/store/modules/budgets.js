// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')
// import Vue from 'vue'

const state = {
  budgetCategories: {},
  budgets: {},
  accounts: {},
  tableKey: 0
}

export const getters = {
  budgetCategories: state => state.budgetCategories,
  budgets: state => state.budgets,
  accounts: state => state.accounts,
  tableKey: state => state.tableKey,
  budgetOptions: state => {
    let result = {}, budgetOptions = []
    Object.assign(result, state.accounts, state.budgets)
    for (var key in result) {
      budgetOptions.push(result[key])
    }
    return budgetOptions.sort((a, b) => (a.label > b.label) ? 1 : -1)
  },
  budgetsArray: state => {
    let result = {}, budgetOptions = []
    Object.assign(result, state.budgets)
    for (var key in result) {
      budgetOptions.push(result[key])
    }
    return budgetOptions.sort((a, b) => (a.label > b.label) ? 1 : -1)
  },
  budgetCategoryOptions: state => {
    let result = {}, budgetOptions = []
    Object.assign(result, state.budgetCategories)
    for (var key in result) {
      budgetOptions.push(result[key])
    }
    return budgetOptions.sort((a, b) => (a.label > b.label) ? 1 : -1)
  },
  headerAccounts: state => {
    let accounts = []
    for (var key in state.accounts) {
      if (state.accounts[key].inHeader === true) {
        accounts.push(state.accounts[key])
      }
    }
    return accounts.sort((a, b) => (a.label > b.label) ? 1 : -1)
  }
}

export const mutations = {
  setBudgetCategories (state, payload) {
    state.budgetCategories = payload
  },
  setBudgets (state, payload) {
    state.budgets = payload
  },
  setAccounts (state, payload) {
    state.accounts = payload
  },
  populateBudgets (state, rootState) {
    // console.log(rootState)
    let transaction = {}
    // console.log(Object.keys(state.budgets).length)
    if ((Object.keys(state.accounts).length > 0) &&
      (Object.keys(state.budgets).length > 0) &&
      (Object.keys(state.budgetCategories).length > 0)) {
      let key

      // reset the calculated values of the budgets
      for (key in state.budgetCategories) {
        state.budgetCategories[key].expenses = 0
        state.budgetCategories[key].income = 0
        state.budgetCategories[key].budget = 0
        state.budgetCategories[key].inUse = false
      }
      for (key in state.budgets) {
        state.budgets[key].expenses = 0
        state.budgets[key].income = 0
        state.budgets[key].inUse = false
        state.budgetCategories[state.budgets[key].category].inUse = true
      }
      for (key in state.accounts) {
        state.accounts[key].expenses = 0
        state.accounts[key].income = 0
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
              state.accounts[transaction.budget].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.budget].inUse = true
              state.budgetCategories[state.budgets[transaction.budget].category].inUse = true
              state.budgets[transaction.budget].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              state.budgetCategories[state.budgets[transaction.budget].category].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
          } else if (transaction.category === 'Income') {
            // calculate the income transactions
            if (state.accounts[transaction.budget]) {
              state.accounts[transaction.budget].inUse = true
              state.accounts[transaction.budget].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.budget].inUse = true
              state.budgetCategories[state.budgets[transaction.budget].category].inUse = true
              state.budgets[transaction.budget].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              state.budgetCategories[state.budgets[transaction.budget].category].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
          } else if (transaction.category === 'Journal') {
            // calculate the journalled transactions
            console.log(transaction, state.accounts, state.accounts[transaction.from], state.accounts[transaction.to])
            if (state.accounts[transaction.from]) {
              state.accounts[transaction.from].inUse = true
              state.accounts[transaction.from].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.from].inUse = true
              state.budgetCategories[state.budgets[transaction.from].category].inUse = true
              state.budgets[transaction.from].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              state.budgetCategories[state.budgets[transaction.from].category].expenses += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
            if (state.accounts[transaction.to]) {
              state.accounts[transaction.to].inUse = true
              state.accounts[transaction.to].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            } else {
              state.budgets[transaction.to].inUse = true
              state.budgetCategories[state.budgets[transaction.to].category].inUse = true
              state.budgets[transaction.to].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
              state.budgetCategories[state.budgets[transaction.to].category].income += parseFloat(transaction.amount) ? parseFloat(transaction.amount) : 0
            }
          }
        }
      }
      for (var budgetKey in state.budgets) {
        // console.log(budgetKey)
        state.budgetCategories[state.budgets[budgetKey].category].budget += parseFloat(state.budgets[budgetKey].budget) ? parseFloat(state.budgets[budgetKey].budget) : 0
        // console.log(state.budgetCategories[state.budgets[budgetKey].category].budget)
      }
      state.tableKey += 1
    }
  },
  setBudgetKey (state, payload) {
    state.budgets[payload.budgetId][payload.key] = payload.val
  },
  setCategoryKey (state, payload) {
    state.budgetCategories[payload.budgetId][payload.key] = payload.val
  }
}

export const actions = {
  fetchBudgetCategories ({ commit, dispatch }, payload) {
    // console.log('Fetch Budget Categories', payload)
    firebase.firestore().collection(`/projects/${payload}/accounts`).where('type', '==', 'category')
      .onSnapshot(async categoriesSnap => {
        // console.log('Fetch Budget Categories')
        let budgets = {}, budget = {}
        let promises = categoriesSnap.docs.map(doc => {
          budget = doc.data()
          budget.id = doc.id
          budget.expenses = 0
          budget.income = 0
          budget.budget = 0
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgetCategories', budgets)
        dispatch('fetchPopulateBudgets')
        // dispatch('fetchPopulateBudgets')
      })
  },
  fetchBudgets ({ commit, dispatch }, payload) {
    // console.log('Fetch Budgets', payload)
    firebase.firestore().collection(`/projects/${payload}/accounts`).where('type', '==', 'budget')
      .onSnapshot(async budgetsSnap => {
        // console.log('Fetch Budgets')
        let budgets = {}, budget = {}
        let promises = budgetsSnap.docs.map(doc => {
          budget = doc.data()
          budget.id = doc.id
          budget.expenses = 0
          budget.income = 0
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgets', budgets)
        dispatch('fetchPopulateBudgets')
      })
  },
  fetchAccounts ({ commit, dispatch }, payload) {
    // console.log('Fetch Budgets', payload)
    firebase.firestore().collection(`/projects/${payload}/accounts`).where('type', '==', 'account')
      .onSnapshot(async accountsSnap => {
        // console.log('Fetch accounts')
        let accounts = {}, account = {}
        let promises = accountsSnap.docs.map(doc => {
          account = doc.data()
          account.id = doc.id
          account.expenses = 0
          account.income = 0
          accounts[account.id] = account
        })
        await Promise.all(promises)
        commit('setAccounts', accounts)
        dispatch('fetchPopulateBudgets')
      })
  },
  fetchPopulateBudgets ({ rootState, commit }) {
    commit('populateBudgets', rootState)
  },
  updateBudgetByKey ({ commit }, payload) {
    commit('setBudgetKey', payload)
  },
  updateCategoryByKey ({ commit }, payload) {
    commit('setCategoryKey', payload)
  }
}
export default {
  state,
  getters,
  mutations,
  actions
}
