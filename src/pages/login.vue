<template>
  <div style="background-color:black;height:100vh;">
    <img
      style="min-height:100vh;min-width:100vw; max-width: 100vw;max-height:100vh; opacity: 0.5;filter: alpha(opacity=50); position: absolute;top:0px"
      src="https://firebasestorage.googleapis.com/v0/b/sp-finance-longterm-assets/o/backgrounds%2Fherson-rodriguez-ueP3nDeqPLY-unsplash.jpg?alt=media&token=c2a47e65-594b-4c4c-8f58-0ea46dd0f34e"
    />
    <div class="text-center text-white" style="padding-top:15vh; z-index:1;">
      <div class="text-h4">Welcome to the Summer Projects Finances App!</div>
      <div class="text-h5">You'll need to login to continue</div>
    </div>
    <div id="loader"><q-spinner /></div>
    <div id="firebaseui-auth-container"></div>
  </div>
</template>
<script>
import firebase from 'firebase/app'
require('firebase/auth')
var firebaseui = require('firebaseui')
// import store from '../store/index.js'
import '../../node_modules/firebaseui/dist/firebaseui.css'

export default {
  mounted() {
    // let self = this
    let uiConfig = {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        'microsoft.com',
        // 'yahoo.com',
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: '/dashboard',
      callbacks: {
        signInSuccessWithAuthResult(authResult, redirectUrl) {
          console.log(authResult, redirectUrl)
          // this.$store.dispatch('fetchCreds')
          // var onUserSignIn = firebase.functions().httpsCallable('onUserSignIn')
          // onUserSignIn({ user: firebase.auth().currentUser }).then((res) => {
          //   // this.$toasted.global.toast_success("User Signed In!")

          // }).catch((err) => {
          //   console.error(err)
          //   // this.$toasted.global.toast_error(`${err}`)
          // })
          // console.log(authResult)
          // if (redirectUrl) {
          //   window.location.href = redirectUrl
          // } else {
          //   window.location.href = '/#/dashboard'
          // }
          return true
        },
        signInFailure(err) {
          console.log(err)
        },
        uiShown: function() {
          // The widget is rendered.
          // Hide the loader.
          document.getElementById('loader').style.display = 'none'
        }
      }
    }
    let ui = firebaseui.auth.AuthUI.getInstance()
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth())
    }
    ui.start('#firebaseui-auth-container', uiConfig)
  }
}
</script>
