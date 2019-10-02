<template>
  <q-page padding>
    <q-banner class="bg-secondary text-white text-center" rounded>
      <div class="text-h4">{{ project.name }}</div>
      <div class="text-subtitle1  q-pb-md">{{ project.number }}</div>
      <div class="text-h6">{{ project.participants }} Participants</div>
      <div class="text-subtitle-1">Project Currency ({{ project.currency }})</div>
    </q-banner>
  </q-page>
</template>

<script>
// import firebase from 'firebase/app'
// require('firebase/firestore')
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      // project: {
      //   name: 'Gold Coast Schoolies',
      //   id: '12345',
      //   participants: 40,
      //   currency: 'AUD'
      // }
    }
  },
  // created () {
  //   this.$store.dispatch('fetchProject', this.$route.params.id)
  // },
  computed: {
    ...mapGetters([
      'project'
    ])
  }
}
</script>
