// import firebase from '../../scripts/firebase'
import {getFirestore, collection, onSnapshot } from 'firebase/firestore'

const state = {
  user: {
    // notChecked: true
  },
  users: [],
  contributors: [],
  invites: [],
  idToken: '',
  userLoadStatus: false,
  listeners: []
}

export const getters = {
  user: state => state.user,
  admins: state => {
    let admins = []
    for (var contributor in state.contributors) {
      if (state.contributors[contributor].permission === 'admin') {
        admins.push(state.contributors[contributor])
      }
    }
    return admins.sort((a, b) => (a.name > b.name ? 1 : -1))
  },
  contributors: state => {
    let contributors = []
    for (var contributor in state.contributors) {
      if (state.contributors[contributor].permission === 'contributor') {
        contributors.push(state.contributors[contributor])
      }
    }
    return contributors.sort((a, b) => (a.name > b.name ? 1 : -1))
  },
  invites: state => {
    let invites = []
    for (var invite in state.invites) {
      invites.push(state.invites[invite])
    }
    return invites.sort((a, b) => (a.name > b.name ? 1 : -1))
  },
  idToken: state => state.idToken,
  userLoadStatus: state => state.userLoadStatus
}

export const mutations = {
  setUser(state, payload) {
    state.user = payload
    // state.logInCheck = true
  },
  setContributors(state, payload) {
    state.contributors = payload
  },
  setIdToken(state, payload) {
    // console.log(payload)
    state.idToken = payload
  },
  setInvites(state, payload) {
    state.invites = payload
  },
  setUserLoadStatus(state, payload) {
    state.userLoadStatus = payload
  },
  addListeners(state, unsub) {
    state.listeners.push(unsub)
  },
  clearListeners(state, {}) {
    
    /*for(let unsub of state.listeners){
      unsub()
    }
    state.listeners = []*/
  }
}

export const actions = {
  fetchContributors({ commit }, payload) {
    // console.log('fetching contributors', payload)
    if(state.contributors.length <= 0)
      commit('clearListeners', false)
      let unsub = onSnapshot(collection(getFirestore(),`/projects/${payload}/contributors`), async adminsSnap => {
        let contributors = []
        let promises = adminsSnap.docs.map(doc => {
          // console.log('contributor ', doc.data())
          contributors.push(doc.data())
        })
        await Promise.all(promises)
        // console.log(members)
        commit('setContributors', contributors)
      })
      commit('addListeners', unsub)
  },
  fetchInvites({ commit }, payload) {
    // console.log('fetching admin', payload)
    if(state.invites.length <= 0)
      commit('clearListeners', false)
      let unsub = onSnapshot(collection(getFirestore(), `/projects/${payload}/invites`), async adminsSnap => {
        let invites = []
        let promises = adminsSnap.docs.map(doc => {
          // console.log('contributor ', doc.data())
          invites.push(doc.data())
        })
        await Promise.all(promises)
        // console.log(members)
        commit('setInvites', invites)
      })
      commit('addListeners', unsub)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
