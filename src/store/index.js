import { createStore } from 'vuex'
import auth from './modules/auth.js'
import actions from './modules/actions.js'
import petty from './modules/petty'
import projects from './modules/projects'
import transactions from './modules/transactions'
import budgets from './modules/budgets'
import { $auth } from './../scripts/firebase.js'
import { onAuthStateChanged, getIdToken } from 'firebase/auth'
import { getFirestore, updateDoc, doc, onSnapshot } from 'firebase/firestore'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */
export default function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      auth,
      actions,
      petty,
      projects,
      transactions,
      budgets
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  onAuthStateChanged($auth, user => {
    // console.log(Store)
    if (user) {
      // console.log(user)
      const { displayName, email, uid, photoURL } = user
      const cleanedUser = { displayName, email, photoURL, uid }
      Store.commit('auth/setUser', cleanedUser)
      getIdToken($auth.currentUser, /* forceRefresh */ true).then(idToken => {
        Store.commit('auth/setIdToken', idToken)
        if (Store.state.projects.project.id) {
          Store.dispatch('transactions/fetchTransactions', Store.state.projects.project.id)
        }
        Store.commit('auth/setUserLoadStatus', true)
      })
      onSnapshot(doc(getFirestore(),`/users/${cleanedUser.uid}`), userSnap => {
        if (
          cleanedUser.displayName !== user.name ||
          cleanedUser.photoURL !== user.photoURL
        ) {
          updateDoc(doc(getFirestore(),`/users/${cleanedUser.uid}`), {
            photoURL: cleanedUser.photoURL,
            name: cleanedUser.displayName
          })
        }
      })
    } else {
      Store.commit('auth/setUser', {})
      Store.commit('auth/setUserLoadStatus', true)
      // state.user =
      // console.log(Vue)
      // Store.$router.push('/login')
      // router.push(`/login?signInSuccessUrl=${router.currentRoute.fullPath}`)
    }
  })

  return Store
}
