// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')
// import Vue from 'vue'

const state = {
  petty: {}
}

export const getters = {
  petty: state => state.petty
}

export const mutations = {
  setPetty (state, payload) {
    state.petty = payload
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
