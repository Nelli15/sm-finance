// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')

async function getReceipt (projectId, idToken, transId) {
  // return firebase.auth().onAuthStateChanged(async (user) => {
  // console.log(idToken, transId, projectId)
  if (idToken > '' && transId > '' && projectId > '') {
    const src = `/receipt?projectId=${projectId}&id=${transId}`
    const options = {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    }

    let res = await fetch(src, options)
    // console.log(transId, res)
    let url = await res.text()
    // console.log(url)
    return url
  }

  // })
}

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
  fetchTransactions ({ commit, dispatch, rootState }, payload) {
    // let transaction = {}
    firebase.firestore().doc(`/projects/${payload}`).collection('/transactions')
      .onSnapshot(async transactionsSnap => {
        // console.log('transaction updated')
        let transactions = []
        let promises = transactionsSnap.docs.map(async doc => {
          let transaction = doc.data()
          transaction.id = doc.id
          transaction.receiptURL = await getReceipt(rootState.projects.project.id, rootState.auth.idToken, transaction.id)
          return transactions.push(transaction)
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
