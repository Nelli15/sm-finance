import firebase from 'firebase/app'
require('firebase/firestore')
require('firebase/auth')
import { Platform } from 'quasar'

const config = {
  apiKey: 'AIzaSyCLMhi-e4x78kXS2_SfoyK4jfnkIJnNP00',
  authDomain: 'sp-finance.firebaseapp.com',
  databaseURL: 'https://sp-finance.firebaseio.com',
  projectId: 'sp-finance',
  storageBucket: 'sp-finance.appspot.com',
  messagingSenderId: '346430274308',
  appId: '1:346430274308:web:c63005fd3a36b14bddee51'
}

firebase.initializeApp(config)

if (Platform.is.cordova) {
  firebase.firestore().enablePersistence()
    .catch(function (err) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
        // console.log(err)
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
        // console.log(err)
      }
    })
}

export default {
  $firebase: firebase,
  $db: firebase.firestore(),
  auth: firebase.auth
}
