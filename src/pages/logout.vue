<template>
    <div>
        <span>Logging out . . .</span>
    </div>
</template>
<script>
import firebase from 'firebase/app'
require('firebase/firestore')

export default {
  mounted () {
    firebase.auth().signOut().then(() => {
      window.location.href = '/#/login'
    })
  }
}
</script>
