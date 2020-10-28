// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')

async function getReceipt(projectId, idToken, transId) {
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
  transactions: [],
  myTransactions: []
}

export const getters = {
  transactions: state => state.transactions,
  myTransactions: state => state.myTransactions
}

export const mutations = {
  setTransactions(state, payload) {
    state.transactions = payload
  },
  setMyTransactions(state, payload) {
    state.myTransactions = payload
  },
  setTransactionKey(state, payload) {
    state.transactions[
      state.transactions.findIndex(x => x.id === payload.trans)
    ][payload.key] = payload.val
  },
  setMyTransactionKey(state, payload) {
    state.myTransactions[
      state.myTransactions.findIndex(x => x.id === payload.trans)
    ][payload.key] = payload.val
  }
}

export const actions = {
  fetchTransactions({ commit, dispatch, rootState }, payload) {
    // let transaction = {}
    firebase
      .firestore()
      .doc(`/projects/${payload}`)
      .collection('/transactions')
      .onSnapshot(async transactionsSnap => {
        // console.log('transaction updated')
        let transactions = []
        let promises = transactionsSnap.docs.map(async doc => {
          let transaction = doc.data()
          transaction.id = doc.id
          transaction.currency =
            transaction.currency > '' ? transaction.currency : 'AUD'
          transaction.deleted = transaction.deleted
            ? transaction.deleted
            : false
          // console.log(transaction)
          if (transaction.receipt === true) {
            transaction.receiptURL = await getReceipt(
              rootState.projects.project.id,
              rootState.auth.idToken,
              transaction.id
            )
          }

          return transactions.push(transaction)
        })
        await Promise.all(promises)
        // console.log(members)
        commit('setTransactions', transactions)
        dispatch('fetchPopulateBudgets')
        // return true
      })
  },
  fetchMyTransactions({ commit, dispatch, rootState }, payload) {
    // let transaction = {}
    firebase
      .firestore()
      .doc(`/projects/${payload.projectId}`)
      .collection('/transactions')
      .where('submittedBy.uid', '==', payload.uid)
      .onSnapshot(async transactionsSnap => {
        // console.log('transaction updated')
        let transactions = []
        let promises = transactionsSnap.docs.map(async doc => {
          let transaction = doc.data()
          transaction.id = doc.id
          transaction.currency =
            transaction.currency > '' ? transaction.currency : 'AUD'
          transaction.deleted = transaction.deleted
            ? transaction.deleted
            : false
          // console.log(transaction)
          if (transaction.receipt === true) {
            transaction.receiptURL = await getReceipt(
              rootState.projects.project.id,
              rootState.auth.idToken,
              transaction.id
            )
          }
          return transactions.push(transaction)
        })
        await Promise.all(promises)
        // console.log(members)
        commit('setMyTransactions', transactions)
        // return true
      })
  },
  updateTransactionByKey({ commit }, payload) {
    commit('setTransactionKey', payload)
  },
  updateMyTransactionByKey({ commit }, payload) {
    commit('setMyTransactionKey', payload)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
