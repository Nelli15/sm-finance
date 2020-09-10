import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
// // import "firebase/messaging"
import 'firebase/auth'
import 'firebase/performance'
import 'firebase/storage'
// import 'firebase/analytics'
// // import "firebase/remote-config"
// // import "firebase/database"

// import { Platform } from 'quasar'

const firestoreSettings = {}

const config = {
  apiKey: 'AIzaSyCLMhi-e4x78kXS2_SfoyK4jfnkIJnNP00',
  authDomain: 'sp-finance.firebaseapp.com',
  databaseURL: 'https://sp-finance.firebaseio.com',
  projectId: 'sp-finance',
  storageBucket: 'sp-finance.appspot.com',
  messagingSenderId: '346430274308',
  appId: '1:346430274308:web:c63005fd3a36b14bddee51'
}

if (!firebase.apps.length) {
  firebase.initializeApp(config)
}

if (window.Cypress) {
  // Needed for Firestore support in Cypress (see https://github.com/cypress-io/cypress/issues/6350)
  firestoreSettings.experimentalForceLongPolling = true
}

// if (shouldUseEmulator) {
//   firestoreSettings.host = 'localhost:8080'
//   // firestoreSettings.ssl = false
//   console.debug(`Using Firestore emulator: ${firestoreSettings.host}`)
// }

const db = firebase.firestore() // .settings(firestoreSettings)
const funcs = firebase.functions()

// console.log(firestoreSettings)
db.settings(firestoreSettings)

if (location.hostname === 'localhost') {
  firestoreSettings.host = 'localhost:8080'
  firestoreSettings.ssl = false
  // console.log(firestoreSettings)
  db.settings(firestoreSettings)
  funcs.useFunctionsEmulator('http://localhost:5001')
}

if (process.env.PROD) {
  db.enablePersistence().catch(function (err) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      // ...
      console.log(err)
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      // ...
      console.log(err)
    }
  })
}

// console.log(funcs)
export const $firebase = firebase
// // export const $db = firebase.database()
export const $firestore = db
export const $auth = firebase.auth()
// // export const $remoteConfig = firebase.remoteConfig()
export const $perform = firebase.performance()
// export const $analytics = firebase.analytics()
export const $functions = funcs
export const $storage = firebase.storage()
// // export const $messaging = messaging

export default {
  $firebase,
  // $db,
  $firestore,
  $auth,
  // $remoteConfig,
  $perform,
  // $analytics,
  // $messaging,
  $functions,
  $storage
}
