<template>
  <q-form
    @reset="onReset"
    @submit="onSubmit"
  >
    <q-list style="min-width: 100px; max-width:500px;">
      <q-item class="text-h6 justify-center">
        <!-- <q-item-section> -->
          Add Transaction
        <!-- </q-item-section> -->
      </q-item>
      <q-item>
        <!-- <q-item-section> -->
        <q-firebase-uploader
          :metadata="{customMetadata: {projectId: projectId, transId: transRef.id, expiry: expiry(1) }}"
          color="secondary"
          flat
          bordered
          style="max-width: 500px"
          ref="transUpload"
          @uploaded="onUploaded"
          @failed="onFailed"
          @added="onAdded"
          @start="onStart"
          auto-upload
          hide-upload-btn
          accept=".jpg, image/*"
          dark
          :label="readOnly ? 'Receipt Submitted' : 'Upload Receipt Image'"
          :readonly="readOnly"
          :disabled="readOnly"
        />
        <!-- </q-item-section> -->
      </q-item>
      <q-item>
        <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
          <!-- <q-date v-model="newTrans.date" dense  /> -->
        <q-input v-model="newTrans.date" mask="date" label="Date" :rules="['date']" dense style="width:100%">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date v-model="newTrans.date" @input="() => $refs.qDateProxy.hide()" mask="DD/MM/YYYY" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
          <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item>
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select :value="newTrans.category > '' ? budgets[newTrans.category] ? budgets[newTrans.category].label : budgetCategories[newTrans.category].label: ''" dense label="Category" :options="isAdmin ? budgetOptions : contributorBudgets" option-label="label" :option-value="(item) => item === null ? null : item.id" @input="newTrans.category = $event.id" style="width:100%"/>
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item>
        <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select v-model="newTrans.type" dense label="Type" :options="typeOptions" style="width:100%" />
          <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-show="newTrans.type === 'Cheque'">
        <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-input v-model="newTrans.cheque" dense label="Cheque #" style="width:100%" />
          <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item>
        <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-input v-model="newTrans.amount" dense :label="'Amount ('+this.project.currency+')'" type="number" />
          <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
        <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-input v-model="newTrans.GST" dense :label="'GST ('+this.project.currency+')'"  type="number" />
          <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item>
        <q-input v-model="newTrans.desc" dense label="Description" style="width:100%" />
      </q-item>
      <q-item>
        <q-btn label="Submit" type="submit" color="secondary" :disable="uploading" />
        <q-btn label="Clear" type="reset" color="secondary" flat class="q-ml-sm" :disable="uploading" />
      </q-item>
    </q-list>
  </q-form>
</template>

<script>
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/firestore')

export default {
  props: ['projectId'],
  data () {
    return {
      newTrans: {
        category: '',
        type: 'Cash',
        date: '',
        amount: '',
        GST: '',
        cheque: '',
        receipt: false,
        desc: ''
      },
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card'],
      transRef: {},
      readOnly: false,
      uploading: false
    }
  },
  created () {
    this.transRef = firebase.firestore().collection(`/projects/${this.projectId}/transactions`).doc()
    let date = new Date()
    this.newTrans.date = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  methods: {
    onAdded (files) {
      console.log('file added', files)
      // files[0].name = 'blah.jpeg'
    },
    onStart (event) {
      console.log('upload started', event)
      this.uploading = true
    },
    onSubmit () {
      console.log('form submitted', this.newTrans.amountAUD)
      this.newTrans.cheque = (this.newTrans.type === 'cheque') ? this.newTrans.cheque : ''
      this.transRef.set(this.newTrans)
      // this.$refs.transUpload.upload()
      // this.$store.dispatch('updateTransactions', this.newTrans)
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Form Submitted'
      })
      this.onReset()
    },
    onReset () {
      console.log('form reset')
      this.newTrans = {
        category: '',
        type: 'Cash',
        date: '',
        amountAUD: '',
        GST: '',
        cheque: '',
        receipt: false,
        desc: ''
      }
      this.readOnly = false
      let date = new Date()
      this.newTrans.date = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
      this.$refs.transUpload.reset()
    },
    onUploaded (event) {
      console.log('file uploaded', event)
      this.readOnly = true
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Receipt Uploaded'
      })
      this.newTrans.receipt = true
      this.uploading = false
    },
    onFailed (event) {
      console.log('file upload failed', event)
      this.$q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Upload Failed'
      })
      this.uploading = false
    },
    expiry (numDays) {
      var date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'budgets',
      'budgetCategories',
      'budgetOptions',
      'isAdmin',
      'contributorBudgets'
    ])
  },
  components: {
    'q-firebase-uploader': () => import('../components/q-firebase-uploader.vue')
  }
}
</script>
