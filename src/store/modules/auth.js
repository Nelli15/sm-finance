// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')

const state = {
  user: {
    // notChecked: true
  },
  users: [],
  contributors: [],
  idToken: ''
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
    return admins
  },
  contributors: state => {
    let contributors = []
    for (var contributor in state.contributors) {
      if (state.contributors[contributor].permission === 'contributor') {
        contributors.push(state.contributors[contributor])
      }
    }
    return contributors
  },
  idToken: state => state.idToken
}

export const mutations = {
  setUser (state, payload) {
    state.user = payload
    // state.logInCheck = true
  },
  setContributors (state, payload) {
    state.contributors = payload
  },
  setIdToken (state, payload) {
    // console.log(payload)
    state.idToken = payload
  }
}

export const actions = {
  fetchContributors ({ commit }, payload) {
    // console.log('fetching contributors')
    firebase.firestore().collection(`/projects/${payload}/contributors`).onSnapshot(async adminsSnap => {
      let contributors = []
      let promises = adminsSnap.docs.map(doc => {
        // console.log('contributor ', doc.data())
        contributors.push(doc.data())
      })
      await Promise.all(promises)
      // console.log(members)
      commit('setContributors', contributors)
    })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
