<template>
  <span>
    <q-btn
      icon="delete"
      color="negative"
      :dense="dense"
      :disabled="disabled"
      @click="confirm = true"
    >
      <q-tooltip
        anchor="center right"
        self="center left"
        class="bg-accent text-black"
      >
        <q-icon name="delete" />
        Delete
      </q-tooltip>
    </q-btn>
    <q-dialog v-model="confirm" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Type 'DELETE' to confirm</span>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input
            label="Confirm Delete"
            stack-label
            :rules="[(v) => v == 'DELETE' || `Input must be 'DELETE'`]"
            v-model="confirmMessage"
            style="width: 100%"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Delete"
            color="negative"
            v-close-popup
            @click="onDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </span>
</template>

<script>
import {
  getFirestore,
  doc,
  deleteDoc,
  updateDoc,
  deleteField,
} from 'firebase/firestore'

export default {
  props: {
    dense: Boolean,
    disabled: Boolean,
    docRef: String,
  },
  data() {
    return {
      confirm: false,
      confirmMessage: '',
    }
  },
  created() {},
  methods: {
    onDelete() {
      // console.log('onDelete')
      if (this.confirmMessage === 'DELETE') {
        this.$q.loading.show()
        // let id = this.docRef.split('/')[this.docRef.split('/').length - 1]
        // // console.log(id)
        // if (this.docRef.includes('transactions')) {
        //   console.log(this.transactions)
        //   if (this.transactions[id].action > '') {
        //     updateDoc(
        //       doc(
        //         getFirestore(),
        //         `/projects/${this.$route.params.id}/actions/${id}`
        //       ),
        //       { [`transactions.${id}`]: deleteField() }
        //     )
        //   }
        // }
        return deleteDoc(doc(getFirestore(), this.docRef))
          .then((res) => {
            // console.log('form submitted', res)
            this.$q.loading.hide()
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: `Deleted Successfully`,
            })
            if (this.docRef.includes('transactions')) {
              this.$emit('deleted', this.docRef)
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.loading.hide()
            this.$q.notify({
              color: 'negative',
              textColor: 'white',
              icon: 'error',
              message: 'Oops, Something went wrong!',
            })
          })
      }
    },
  },
  computed: {},
  watch: {},
  components: {},
}
</script>
