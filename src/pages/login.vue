<template>
    <div>
        <div class="text-center my-4">
            <h2>Welcome to the SP Finances App!</h2>
            <h4>You'll need to login to continue</h4>
        </div>
        <div id="firebaseui-auth-container"></div>
    </div>
</template>
<script>
import firebase from 'firebase'
var firebaseui = require('firebaseui')
// import store from '../store/index.js'
import '../../node_modules/firebaseui/dist/firebaseui.css'

export default {
  mounted () {
    // let self = this
    let uiConfig = {
      signInOptions: [{
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID
      },
      {
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID
      }],
      callbacks: {
        signInSuccessWithAuthResult (authResult, redirectUrl) {
          // this.$store.dispatch('fetchCreds')
          // var onUserSignIn = firebase.functions().httpsCallable('onUserSignIn')
          // onUserSignIn({ user: firebase.auth().currentUser }).then((res) => {
          //   // this.$toasted.global.toast_success("User Signed In!")

          // }).catch((err) => {
          //   console.error(err)
          //   // this.$toasted.global.toast_error(`${err}`)
          // })
          // console.log(authResult)
          if (redirectUrl) {
            window.location.href = redirectUrl
          } else {
            window.location.href = '/#/dashboard'
          }
        }
      }
    }
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
  }
}
</script>
