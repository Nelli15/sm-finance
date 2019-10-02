import Vue from 'vue'
import Vuex from 'vuex'
import firebase from '../scripts/firebase'
import auth from './modules/auth.js'
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
      const { displayName, email, uid, photoURL } = user
      const cleanedUser = { displayName, email, photoURL, uid }
      Store.commit('setUser', cleanedUser)
    } else {
      Store.commit('setUser', {})
      // state.user =
      // console.log(Vue)
      Store.$router.push('/login')
      // router.push(`/login?signInSuccessUrl=${router.currentRoute.fullPath}`)
    }
  })

  return Store
}
