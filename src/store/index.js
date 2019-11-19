import Vue from 'vue'
import Vuex from 'vuex'
import firebase from '../scripts/firebase'
import auth from './modules/auth.js'
import petty from './modules/petty'
import projects from './modules/projects'
import transactions from './modules/transactions'
import budgets from './modules/budgets'

// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      auth,
      petty,
      projects,
      transactions,
      budgets
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  firebase.auth().onAuthStateChanged((user) => {
    // console.log(Store)
    if (user) {
      console.log(user)
      const { displayName, email, uid, photoURL } = user
      const cleanedUser = { displayName, email, photoURL, uid }
      Store.commit('setUser', cleanedUser)
      firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
        .then((idToken) => {
          Store.commit('setIdToken', idToken)
          if (Store.state.projects.project) {
            Store.dispatch('fetchTransactions', Store.state.projects.project.id)
          }
          Store.commit('setUserLoadStatus', true)
        })
      firebase.$db.doc(`/users/${cleanedUser.uid}`).onSnapshot(userSnap => {
        if ((cleanedUser.displayName !== user.name) || (cleanedUser.photoURL !== user.photoURL)) {
          firebase.$db.doc(`/users/${cleanedUser.uid}`).update({ photoURL: cleanedUser.photoURL, name: cleanedUser.displayName })
        }
      })
    } else {
      Store.commit('setUser', {})
      Store.commit('setUserLoadStatus', true)
      // state.user =
      // console.log(Vue)
      // Store.$router.push('/login')
      // router.push(`/login?signInSuccessUrl=${router.currentRoute.fullPath}`)
    }
  })

  return Store
}
