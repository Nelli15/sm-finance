// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')

const state = {
  user: {
    // notChecked: true
  },
  users: [],
  contributors: [],
  invites: [],
  idToken: '',
  userLoadStatus: false
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
  }
}

export const actions = {
  fetchContributors({ commit }, payload) {
    // console.log('fetching contributors')
    firebase
      .firestore()
      .collection(`/projects/${payload}/contributors`)
      .onSnapshot(async adminsSnap => {
        let contributors = []
        let promises = adminsSnap.docs.map(doc => {
          // console.log('contributor ', doc.data())
          contributors.push(doc.data())
        })
        await Promise.all(promises)
        // console.log(members)
        commit('setContributors', contributors)
      })
  },
  fetchInvites({ commit }, payload) {
    // console.log('fetching contributors')
    firebase
      .firestore()
      .collection(`/projects/${payload}/invites`)
      .onSnapshot(async adminsSnap => {
        let invites = []
        let promises = adminsSnap.docs.map(doc => {
          // console.log('contributor ', doc.data())
          invites.push(doc.data())
        })
        await Promise.all(promises)
        // console.log(members)
        commit('setInvites', invites)
      })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
