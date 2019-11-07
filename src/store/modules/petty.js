// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')
// import Vue from 'vue'

const state = {
  transactions: {}
}

export const getters = {
  pettyTransactions: state => state.transactions,
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
  }
}

export const mutations = {
  setPetty (state, payload) {
    state.transactions = payload
  }
}

export const actions = {
  fetchPetty ({ commit }, payload) {
    firebase.firestore().doc(`/projects/${payload}`).collection('/petty')
      .onSnapshot(async transactionsSnap => {
        // console.log('transaction updated')
        let transactions = []
        let promises = transactionsSnap.docs.map(doc => {
          transactions.push(doc.data())
        })
        await Promise.all(promises)
        // console.log(members)
        // commit('setTransactions', transactions)
        commit('setPetty', transactions)
        // dispatch('fetchPopulateBudgets')
        // return true
      })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
