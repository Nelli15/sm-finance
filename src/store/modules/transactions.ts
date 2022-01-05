// import firebase from '../../scripts/firebase'
import {
  CollectionReference,
  DocumentReference,
  Query,
} from 'firebase/firestore'
import {
  getFirestore,
  onSnapshot,
  query,
  where,
  collection,
  getDoc,
  doc,
} from 'firebase/firestore'
import { Commit, Dispatch } from 'vuex'

import { Transaction, TransactionList } from '../../services/transaction'

interface State {
  transactions: TransactionList
  myTransactions: TransactionList
}
interface ActionListObject {
  id: string
  purpose: string
}

const state = {
  transactions: {},
  myTransactions: {},
}

export const getters = {
  transactions: (state: State) => Object.values(state.transactions),
  transFromList:
    (state: State) => (list: { [key: string]: ActionListObject }) => {
      let listArr = Object.values(list).map((val: ActionListObject) => val.id)
      return Object.values(state.transactions).filter((val: any) =>
        listArr.includes(val.id)
      )
    },
  myTransactions: (state: State) => Object.values(state.myTransactions),
}

export const mutations = {
  setTransactions(state: State, payload: TransactionList) {
    //sets the transactions object in store equal to the payload
    state.transactions = payload
  },
  setTransaction(state: State, transaction: Transaction) {
    // assigns the payload to a single transaction at key payload.id
    state.transactions[transaction.id] = transaction
  },
  setTransURL(
    state: State,
    { transId, url }: { transId: string; url: string }
  ) {
    // assigns the payload to a single transaction at key payload.id
    state.transactions[transId].receiptURL = url
  },
  setMyTransactions(state: State, payload: TransactionList) {
    state.myTransactions = payload
  },
  setMyTransURL(
    state: State,
    { transId, url }: { transId: string; url: string }
  ) {
    // assigns the payload to a single transaction at key payload.id
    state.myTransactions[transId].receiptURL = url
  },
  setMyTransaction(state: State, trans: Transaction) {
    state.myTransactions[trans.id] = trans
  },
  setTransactionKey(
    state: State,
    {
      transId,
      key,
      val,
    }: {
      transId: string
      key: string
      val: string | number | boolean | Date | null
    }
  ) {
    state.transactions[transId][key] = val
  },
  setMyTransactionKey(
    state: State,
    {
      transId,
      key,
      val,
    }: {
      transId: string
      key: string
      val: string | number | boolean | Date | null
    }
  ) {
    state.myTransactions[transId][key] = val
  },
}

export const actions = {
  async getReceipt(
    { commit }: { commit: Commit },
    {
      projectId,
      idToken,
      transId,
    }: { projectId: string; idToken: string; transId: string }
  ) {
    // return firebase.auth().onAuthStateChanged(async (user) => {
    if (idToken > '' && transId > '' && projectId > '') {
      const src = `/receipt?projectId=${projectId}&id=${transId}`
      const options = {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }

      let res = await fetch(src, options).catch((err) => {
        console.log(
          `failed to fetch receipt for projectId=${projectId} & id=${transId}`
        )
      })
      if (!res) return commit('setMyTransURL', { transId, url: '' })
      let url = await res.text().catch((err) => {
        console.log(
          `failed to fetch receipt for projectId=${projectId} & id=${transId}`
        )
      })
      if (url && url.startsWith('https://')) {
        commit('setTransURL', { transId, url })
      } else {
        console.log('failed to get url for ', transId)
        commit('setTransURL', { transId, url: '' })
      }
    } else {
      console.log('insufficient info provided to get receipt')
    }

    // })
  },
  async getMyReceipt(
    { commit }: { commit: Commit },
    {
      projectId,
      idToken,
      transId,
    }: { projectId: string; idToken: string; transId: string }
  ) {
    // return firebase.auth().onAuthStateChanged(async (user) => {
    if (idToken > '' && transId > '' && projectId > '') {
      const src = `/receipt?projectId=${projectId}&id=${transId}`
      const options = {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }

      let res = await fetch(src, options).catch((err) => {
        console.log(
          `failed to fetch receipt for projectId=${projectId} & id=${transId}`
        )
      })
      // console.log(transId, res)
      if (!res) return commit('setMyTransURL', { transId, url: '' })
      let url = await res.text().catch((err) => {
        console.log(
          `failed to fetch receipt for projectId=${projectId} & id=${transId}`
        )
      })

      // console.log(url)
      if (url && url.startsWith('https://')) {
        commit('setMyTransURL', { transId, url })
      } else {
        console.log('failed to get url for ', transId)
        commit('setMyTransURL', { transId, url: '' })
      }
    } else {
      console.log('insufficient info provided to get receipt')
    }

    // })
  },
  fetchTransactions(
    {
      commit,
      dispatch,
      rootState,
    }: { commit: Commit; dispatch: Dispatch; rootState: any },
    projectId: string
  ) {
    // reset transactions
    commit('setTransactions', {})
    return Transaction.fetchTrans(
      collection(getFirestore(), `/projects/${projectId}/transactions`),
      async (_transactions: any) => {
        for (let trans of _transactions) {
          trans.currency = trans.currency > '' ? trans.currency : 'AUD'
          trans.deleted = trans.deleted ? trans.deleted : false
          if (trans.receipt === true) {
            trans.receiptURL = 'loading'
            dispatch('getReceipt', {
              projectId,
              idToken: rootState.auth.idToken,
              transId: trans.id,
            })
          } else {
            trans.receiptURL = ''
          }
          commit('setTransaction', trans)
        }

        return true
      }
    )
  },
  fetchMyTransactions(
    {
      commit,
      dispatch,
      rootState,
    }: { commit: Commit; dispatch: Dispatch; rootState: any },
    { projectId, uid }: { projectId: string; uid: string }
  ) {
    // reset transactions
    commit('setTransactions', {})
    return Transaction.fetchTrans(
      query(
        collection(getFirestore(), `/projects/${projectId}/transactions`),
        where('submittedBy.uid', '==', uid)
      ),
      async (_transactions: any) => {
        for (let trans of _transactions) {
          trans.currency = trans.currency > '' ? trans.currency : 'AUD'
          trans.deleted = trans.deleted ? trans.deleted : false
          if (trans.receipt === true) {
            trans.receiptURL = 'loading'
            dispatch('getMyReceipt', {
              projectId,
              idToken: rootState.auth.idToken,
              transId: trans.id,
            })
          } else {
            trans.receiptURL = ''
          }
          commit('setMyTransaction', trans)
        }

        return true
      }
    )
  },
  fetchTransWithList(
    {
      state,
      commit,
      dispatch,
      rootState,
    }: { state: State; commit: Commit; rootState: any; dispatch: Dispatch },
    { projectId, list }: { projectId: string; list: ActionListObject }
  ) {
    // loop through the list of transactions to check they are all in the transactions object
    if (!list) return
    let _list = Object.values(list)
    for (let item of _list) {
      //check if the transaction is already downloaded and if not add it
      if (state.transactions[item.id]) continue
      //transaction not in transaction object, download it
      let ref = doc(
        getFirestore(),
        `/projects/${projectId}/transactions/${item.id}`
      )
      Transaction.fetchTrans(ref, async (trans: any) => {
        // overwrite the currency in the transaction with the project currency
        trans.currency = trans.currency > '' ? trans.currency : 'AUD'
        //check the deleted field is complete
        trans.deleted = trans.deleted ? trans.deleted : false
        //get the url for the receipt image if the receipt field is true
        if (trans.receipt === true) {
          trans.receiptURL = 'loading'
          dispatch('getReceipt', {
            projectId,
            idToken: rootState.auth.idToken,
            transId: trans.id,
          })
        } else {
          trans.receiptURL = ''
        }
        // save the transaction
        commit('setTransaction', trans)
      })
    }
  },
  fetchTransWithRef(
    {
      state,
      commit,
      rootState,
      dispatch,
    }: { state: State; commit: Commit; rootState: any; dispatch: Dispatch },
    {
      projectId,
      ref,
    }: {
      projectId: string
      ref: DocumentReference | CollectionReference | Query
    }
  ) {
    // reset transactions
    commit('setTransactions', {})
    Transaction.fetchTrans(ref, async (transactions: TransactionList) => {
      for (let key in transactions) {
        let trans = transactions[key]
        trans.currency = trans.currency > '' ? trans.currency : 'AUD'
        trans.deleted = trans.deleted ? trans.deleted : false
        if (trans.receipt === true) {
          trans.receiptURL = 'loading'
          dispatch('getReceipt', {
            projectId,
            idToken: rootState.auth.idToken,
            transId: trans.id,
          })
        } else {
          trans.receiptURL = ''
        }
        commit('setTransaction', trans)
      }
    })
  },
  fetchTransById(
    {
      state,
      dispatch,
      rootState,
    }: { state: State; dispatch: Dispatch; rootState: any },
    { projectId, id }: { projectId: string; id: string }
  ) {
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
        doc(getFirestore(), `/projects/${projectId}/transactions/${id}`)
      )
        .then(async (doc) => {
          let transaction = doc.data()
          if (!transaction) return {}
          transaction.id = doc.id
          transaction.currency =
            transaction.currency > '' ? transaction.currency : 'AUD'
          transaction.deleted = transaction.deleted
            ? transaction.deleted
            : false
          if (transaction.receipt === true) {
            transaction.receiptURL = 'loading'
            dispatch('getReceipt', {
              projectId: rootState.projects.project.id,
              idToken: rootState.auth.idToken,
              transId: transaction.id,
            })
          } else {
            transaction.receiptURL = ''
          }
          return transaction
        })
        .catch((err) => {
          console.error(err)
        })
    }
  },
  updateTransactionByKey(
    { commit }: { commit: Commit },
    { transId, key, val }: { transId: string; key: string; val: any }
  ) {
    commit('setTransactionKey', { transId, key, val })
  },
  updateMyTransactionByKey(
    { commit }: { commit: Commit },
    { transId, key, val }: { transId: string; key: string; val: any }
  ) {
    commit('setMyTransactionKey', { transId, key, val })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
