// import firebase from '../../scripts/firebase'
import {getFirestore, collection, onSnapshot } from 'firebase/firestore'

const state = {
  user: {
  },
  users: [],
  contributors: [],
  invites: [],
  idToken: '',
  userLoadStatus: false,
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
  },
  setContributors(state, payload) {
    state.contributors = payload
  },
  setIdToken(state, payload) {
    state.idToken = payload
  },
  setInvites(state, payload) {
    state.invites = payload
  },
  setUserLoadStatus(state, payload) {
    state.userLoadStatus = payload
  },
}

export const actions = {
  fetchContributors({ commit }, payload) {
    if(state.contributors.length <= 0)
      onSnapshot(collection(getFirestore(),`/projects/${payload}/contributors`), async adminsSnap => {
        let contributors = []
        let promises = adminsSnap.docs.map(doc => {
          contributors.push(doc.data())
        })
        await Promise.all(promises)
        commit('setContributors', contributors)
      })
  },
  fetchInvites({ commit }, payload) {
    if(state.invites.length <= 0)
      onSnapshot(collection(getFirestore(), `/projects/${payload}/invites`), async adminsSnap => {
        let invites = []
        let promises = adminsSnap.docs.map(doc => {
          invites.push(doc.data())
        })
        await Promise.all(promises)
        commit('setInvites', invites)
      })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
