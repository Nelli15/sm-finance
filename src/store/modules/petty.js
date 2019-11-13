// import firebase from '../../scripts/firebase'
// import firebase from 'firebase/app'
// require('firebase/firestore')
// import Vue from 'vue'

const state = {
  petty: {},
  transactions: {}
}

export const getters = {
  pettyTotals: state => {
    let credits = 0
    let debits = 0
    for (var transKey in state.transactions) {
      let transaction = state.transactions[transKey]
      if (transaction.category === 'credit') {
        credits += transaction.amountAUD
      } else if (transaction.category === 'debit') {
        debits += transaction.amountAUD
      }
    }
    return debits - credits
  },
  dollars: state => {
    return state.petty.dollars ? state.petty.dollars : {}
  },
  cents: state => {
    return state.petty.cents ? state.petty.cents : {}
  }
}

export const mutations = {
  setPetty (state, payload) {
    state.petty = payload
  },
  setPettyKey (state, payload) {
    state.petty[payload.key] = payload.val
  }
}

export const actions = {
  updatePettyByKey ({ commit }, payload) {
    commit('setPettyKey', payload)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
