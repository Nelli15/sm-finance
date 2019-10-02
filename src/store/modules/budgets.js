// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')
// import Vue from 'vue'

const state = {
  budgets: [],
  tableKey: 0
}

export const getters = {
  budgets: state => state.budgets,
  tableKey: state => state.tableKey
}

export const mutations = {
  setBudgets (state, payload) {
    state.budgets = payload
  },
  populateBudgets (state, rootState) {
    // console.log(rootState)
    let transaction = {}
    let total = 0
    let budget
    for (var key in state.budgets) {
      budget = state.budgets[key]
      total = 0
      for (var transKey in rootState.transactions.transactions) {
        transaction = rootState.transactions.transactions[transKey]
        if (!transaction.deleted && transaction.category === budget.category) {
          total += parseInt(transaction.amountAUD)
        }
      }
      budget.spent = total
      state.budgets[key] = budget
      // state.budgets[key] = { ...state.budgets[key], [key]: budget }
      // Vue.set(state.budgets[key], 'spent', total)
      state.tableKey += 1
    }
    // commit('setBudgets', budgets)
  }
}

export const actions = {
  fetchBudgets ({ commit, dispatch }, payload) {
    firebase.firestore().doc(`/projects/${payload}`).collection('/budgets')
      .onSnapshot(async budgetsSnap => {
        let budgets = []
        let promises = budgetsSnap.docs.map(doc => {
          budgets.push(doc.data())
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
