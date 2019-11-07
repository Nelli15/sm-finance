<template>
  <span>
    <q-btn icon="delete" color="negative" :dense="dense" :disabled="disabled" @click="confirm = true"/>
    <q-dialog v-model="confirm" persistent>
      <q-card style="min-width:400px">
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Type 'DELETE' to confirm</span>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input label="Confirm Delete" stack-label :rules="[ v => v == 'DELETE' || `Input must be 'DELETE'`]"  v-model="confirmMessage" style="width:100%" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" v-close-popup @click="onDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </span>
</template>

<script>
// import { debounce } from 'quasar'
import firebase from 'firebase/app'
// require('firebase/auth')
require('firebase/firestore')

export default {
  props: {
    dense: Boolean,
    disabled: Boolean,
    docRef: String
  },
  data () {
    return {
      confirm: false,
      confirmMessage: ''
    }
  },
  created () {
  },
  methods: {
    onDelete () {
      console.log('onDelete')
      if (this.confirmMessage === 'DELETE') {
        firebase.firestore().doc(this.docRef).delete()
      }
    }
  },
  computed: {
  },
  watch: {
  },
  components: {
  }
}
</script>
