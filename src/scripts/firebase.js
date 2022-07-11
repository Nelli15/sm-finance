import { initializeApp } from 'firebase/app'
import {
  initializeAuth,
  browserSessionPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
} from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

// import { Platform } from 'quasar'

const firestoreSettings = {}

const config = require(`./../../firebaseConfig.json`)

let firebaseApp = initializeApp(config)

const storageApp = getStorage(firebaseApp)

if (location.hostname === 'localhost') {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(
      '6LcMc94gAAAAAPqFihhwfpdfmmvyuf6-pUGCWtD5'
    ),
  })
} else {
  const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(
      '6LcMc94gAAAAAPqFihhwfpdfmmvyuf6-pUGCWtD5'
    ),

    // Optional argument. If true, the SDK automatically refreshes App Check
    // tokens as needed.
    isTokenAutoRefreshEnabled: true,
  })
}

if (location.hostname === 'localhost') {
  firestoreSettings.host = 'localhost:8080'
  firestoreSettings.ssl = false
  firestoreSettings.experimentalAutoDetectLongPolling = true
  connectFunctionsEmulator(getFunctions(firebaseApp), 'localhost', '5001')
  // useDatabaseEmulator(dbApp, "localhost", "9000")
  connectStorageEmulator(storageApp, 'localhost', 9199)
}
// firestoreSettings.cacheSizeBytes = CACHE_SIZE_UNLIMITED;
if (window.Cypress) {
  // Needed for Firestore support in Cypress (see https://github.com/cypress-io/cypress/issues/6350)
  firestoreSettings.experimentalForceLongPolling = true
}

const db = initializeFirestore(firebaseApp, firestoreSettings) // .settings(firestoreSettings)
// setLogLevel('debug')
const funcs = getFunctions()
// if (process.env.PROD) {
// enableMultiTabIndexedDbPersistence(db).catch(function(err) {
//   console.log(err);
//   if (err.code === "failed-precondition") {
//     // Multiple tabs open, persistence can only be enabled
//     // in one tab at a a time.
//     // ...
//     console.log(err);
//   } else if (err.code === "unimplemented") {
//     // The current browser does not support all of the
//     // features required to enable persistence
//     // ...
//     console.log(err);
//   }
// });
// }

const authApp = initializeAuth(firebaseApp, {
  persistence: browserSessionPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
})

if (location.hostname === 'localhost') {
  connectAuthEmulator(authApp, 'http://127.0.0.1:9099')
}

export const $firebase = firebaseApp
export const $auth = authApp

export default {
  $firebase,
  $auth,
}
