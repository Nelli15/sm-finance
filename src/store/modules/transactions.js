// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')

const state = {
  transactions: []
}

export const getters = {
  transactions: state => state.transactions
}

export const mutations = {
  setTransactions (state, payload) {
    state.transactions = payload
  }
}

export const actions = {
  fetchTransactions ({ commit, dispatch }, payload) {
    firebase.firestore().doc(`/projects/${payload}`).collection('/transactions')
      .onSnapshot(async transactionsSnap => {
        // console.log('transaction updated')
        let transactions = []
        let promises = transactionsSnap.docs.map(doc => {
          transactions.push(doc.data())
        })
        await Promise.all(promises)
        // console.log(members)
        commit('setTransactions', transactions)
        dispatch('fetchPopulateBudgets')
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
