// import firebase from '../../scripts/firebase'
import { getFirestore, onSnapshot, query, where, collection, getDoc, doc } from 'firebase/firestore'
import {Transaction} from './../../services/transaction'
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
  transactions: {},
  myTransactions: [],
  listeners: []
}

export const getters = {
  transactions: state => Object.values(state.transactions),
  myTransactions: state => state.myTransactions,
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
  // fetchTransactions({ commit, dispatch, rootState }, payload) {
  //   // let transaction = {}
  //   commit('clearListeners', false)
  //     let unsub = onSnapshot(collection(getFirestore(), `/projects/${payload}/transactions`),async transactionsSnap => {
  //       // console.log('transaction updated')
  //       let transactions = []
  //       let promises = transactionsSnap.docs.map(async doc => {
  //         let transaction = doc.data()
  //         transaction.id = doc.id
  //         transaction.currency =
  //           transaction.currency > '' ? transaction.currency : 'AUD'
  //         transaction.deleted = transaction.deleted
  //           ? transaction.deleted
  //           : false
  //         // console.log(transaction)
  //         if (transaction.receipt === true) {
  //           transaction.receiptURL = await getReceipt(
  //             rootState.projects.project.id,
  //             rootState.auth.idToken,
  //             transaction.id
  //           )
  //         }

  //         return transactions.push(transaction)
  //       })
  //       await Promise.all(promises)
  //       // console.log(members)
  //       commit('setTransactions', transactions)
  //       dispatch('budgets/fetchPopulateBudgets', false, { root: true})
  //       // return true
  //     })
  //     commit('addListeners', unsub)
  // },
    fetchTransactions({ commit, dispatch, rootState }, projectId) {
      // reset transactions
    commit('setTransactions', {})
      Transaction.fetchTrans(collection(getFirestore(), `/projects/${projectId}/transactions`), async transactions => {
        // console.log(transactions)
        for(let trans of transactions){
        //  trans.id = doc.id
         trans.currency = trans.currency > '' ? trans.currency : 'AUD'
         trans.deleted = trans.deleted ? trans.deleted : false
          if (trans.receipt === true) {
           trans.receiptURL = await getReceipt(
              projectId,
              rootState.auth.idToken,
             trans.id
            )
          }
        }
        commit('setTransactions', transactions)
      })
  },
  fetchMyTransactions({ commit, dispatch, rootState }, payload) {
    // let transaction = {}
      commit('clearListeners', false)
      let unsub = onSnapshot(query(collection(getFirestore(),`/projects/${payload.projectId}/transactions`), where('submittedBy.uid', '==', payload.uid)), async transactionsSnap => {
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
      commit('addListeners', unsub)
  },
  fetchTransWithList({state, commit, rootState}, {projectId, ref, list}) {
    let transactions = {}
    // reset transactions
    commit('setTransactions', {})
    for(let item of list) {
      Transaction.fetchTrans(ref, async trans => {
         trans.currency = trans.currency > '' ? trans.currency : 'AUD'
         trans.deleted = trans.deleted ? trans.deleted : false
          if (trans.receipt === true) {
           trans.receiptURL = await getReceipt(
              projectId,
              rootState.auth.idToken,
              trans.id
            )
            transactions[item.id] = trans
        }
      })
    }
    commit('setTransactions', transactions)
  },
  fetchTransWithRef({state, commit, rootState}, {projectId, ref}) {
    let transactions = {}
    // reset transactions
    commit('setTransactions', {})
      Transaction.fetchTrans(ref, async trans => {
         trans.currency = trans.currency > '' ? trans.currency : 'AUD'
         trans.deleted = trans.deleted ? trans.deleted : false
          if (trans.receipt === true) {
           trans.receiptURL = await getReceipt(
              projectId,
              rootState.auth.idToken,
              trans.id
            )
            transactions[trans.id] = trans
        }
      })
    commit('setTransactions', transactions)
  },
  fetchTransById({state, commit, rootState}, {projectId, id}) {
    //  Transaction.fetchTrans(doc(getFirestore(), `/projects/${projectId}/transactions/${id}`), async transaction => {
    //     // console.log(transactions)
    //     for(let trans of transactions){
    //     //  trans.id = doc.id
    //      trans.currency = trans.currency > '' ? trans.currency : 'AUD'
    //      trans.deleted = trans.deleted ? trans.deleted : false
    //       if (trans.receipt === true) {
    //        trans.receiptURL = await getReceipt(
    //           projectId,
    //           rootState.auth.idToken,
    //          trans.id
    //         )
    //       }
    //     }
    //     commit('setTransactions', transactions)
    //   })
    if (state.transactions[id]) {
      //   console.log('1')
      return state.transactions[id]
    } else {
      return getDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/transactions/${id}`
        )
      ).then(async doc => {
        let transaction = doc.data()
          transaction.id = doc.id
          transaction.currency =
            transaction.currency > '' ? transaction.currency : 'AUD'
          transaction.deleted = transaction.deleted
            ? transaction.deleted
            : false
          console.log(transaction.receipt)
          if (transaction.receipt === true) {
            transaction.receiptURL = await getReceipt(
              rootState.projects.project.id,
              rootState.auth.idToken,
              transaction.id
            )
            console.log(transaction.receiptURL)
          }
        return transaction
      }).catch(err => {
        console.error(err)
      })
    }
  },
  updateTransactionByKey({ commit }, payload) {
    commit('setTransactionKey', payload)
  },
  updateMyTransactionByKey({ commit }, payload) {
    commit('setMyTransactionKey', payload)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
