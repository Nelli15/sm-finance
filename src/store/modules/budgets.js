// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')
// import Vue from 'vue'

const state = {
  budgetCategories: {},
  budgets: [],
  tableKey: 0
}

export const getters = {
  budgetCategories: state => state.budgetCategories,
  budgets: state => state.budgets,
  tableKey: state => state.tableKey,
  budgetOptions: state => {
    let result = {}, budgetOptions = []
    Object.assign(result, state.budgetCategories, state.budgets)
    for (var key in result) {
      budgetOptions.push(result[key])
    }
    return budgetOptions.sort((a, b) => (a.label > b.label) ? 1 : -1)
  }
}

export const mutations = {
  setBudgetCategories (state, payload) {
    state.budgetCategories = payload
  },
  setBudgets (state, payload) {
    state.budgets = payload
  },
  populateBudgets (state, rootState) {
    // console.log(rootState)
    let transaction = {}, budgetCategory = {}
    let total = 0, budgeted = 0
    let budget
    let found = false
    for (var key in state.budgets) {
      budget = state.budgets[key]
      total = 0
      for (var transKey in rootState.transactions.transactions) {
        transaction = rootState.transactions.transactions[transKey]
        if (!transaction.deleted && transaction.category === budget.id) {
          total += parseInt(transaction.amount) ? parseInt(transaction.amount) : 0
        }
      }
      budget.spent = total
      state.budgets[key] = budget
      // state.budgets[key] = { ...state.budgets[key], [key]: budget }
      // Vue.set(state.budgets[key], 'spent', total)
      // state.tableKey += 1
    }

    // let transaction = {}
    // let total = 0
    // let budget
    for (key in state.budgetCategories) {
      budgetCategory = state.budgetCategories[key]
      total = 0
      budgeted = 0
      found = false
      for (transKey in rootState.transactions.transactions) {
        transaction = rootState.transactions.transactions[transKey]
        if (!transaction.deleted && transaction.category === budgetCategory.id) {
          total += parseInt(transaction.amount) ? parseInt(transaction.amount) : 0
        }
      }
      for (var budgetKey in state.budgets) {
        budget = state.budgets[budgetKey]
        if (budget.category === budgetCategory.id) {
          total += parseInt(budget.spent) ? parseInt(budget.spent) : 0
          budgeted += parseInt(budget.budget) ? parseInt(budget.budget) : 0
          found = true
        }
      }
      // console.log(total)
      budgetCategory.spent = total
      if (found) {
        budgetCategory.budget = budgeted
      }
      state.budgetCategories[key] = budgetCategory
      // state.budgets[key] = { ...state.budgets[key], [key]: budget }
      // Vue.set(state.budgets[key], 'spent', total)
      state.tableKey += 1
    }
    // commit('setBudgets', budgets)
  }
}

export const actions = {
  fetchBudgetCategories ({ commit, dispatch }, payload) {
    firebase.firestore().doc(`/projects/${payload}`).collection('/budgets').where('sub', '==', false)
      .onSnapshot(async budgetsSnap => {
        let budgets = {}, budget = {}
        let promises = budgetsSnap.docs.map(doc => {
          budget = doc.data()
          budget.id = doc.id
          budget.label = budget.category
          // console.log(budget)
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgetCategories', budgets)
        dispatch('fetchPopulateBudgets')
        // dispatch('fetchPopulateBudgets')
      })
  },
  fetchBudgets ({ commit, dispatch }, payload) {
    firebase.firestore().doc(`/projects/${payload}`).collection('/budgets').where('sub', '==', true)
      .onSnapshot(async budgetsSnap => {
        let budgets = {}, budget = {}
        let promises = budgetsSnap.docs.map(doc => {
          budget = doc.data()
          budget.id = doc.id
          budgets[budget.id] = budget
        })
        await Promise.all(promises)
        commit('setBudgets', budgets)
        dispatch('fetchPopulateBudgets')
      })
  },
  fetchPopulateBudgets ({ rootState, commit }) {
    commit('populateBudgets', rootState)
  }
}
export default {
  state,
  getters,
  mutations,
  actions
}
