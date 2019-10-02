// import firebase from '../../scripts/firebase'
import firebase from 'firebase/app'
require('firebase/firestore')

const state = {
  user: {
    // notChecked: true
  },
  users: [],
  contributors: []
}

export const getters = {
  user: state => state.user,
  admins: state => {
    let admins = []
    for (var contributor in state.contributors) {
      if (contributor.permission === 'admin') {
        admins.push(contributor)
      }
    }
    return admins
  },
  contributors: state => state.contributors
}

export const mutations = {
  setUser (state, payload) {
    state.user = payload
    // state.logInCheck = true
  },
  setContributors (state, payload) {
    state.contributors = payload
  }
}

export const actions = {
  fetchContributors ({ commit }, payload) {
    firebase.firestore().doc(`/projects/${payload}/admins`).onSnapshot(async adminsSnap => {
      let contributors = []
      let promises = adminsSnap.docs.map(doc => {
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
