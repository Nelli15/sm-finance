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
        <q-input v-model="newTrans.date" mask="##/##/####" label="Date"
        :rules="[v => /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(v) || 'Not a Date']" dense style="width:100%">
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
      <q-item v-show="isAdmin">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="newTrans.category"
          dense
          label="Category"
          :options="categoryOptions"
          @input="newTrans.category = $event"
          style="width:100%"
        >
        </q-select>
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
      <q-item v-show="newTrans.category !== 'Journal'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="newTrans.budget > '' ? budgets[newTrans.budget] ? budgets[newTrans.budget].label : accounts[newTrans.budget].label: ''"
          dense
          label="Budget"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="(item) => item === null ? null : item.id"
          @input="newTrans.to = $event.id"
          style="width:100%"
          use-input
          @filter="filterBudgets"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-show="newTrans.category === 'Journal'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="newTrans.from > '' ? budgets[newTrans.from] ? budgets[newTrans.from].label : accounts[newTrans.from].label: ''"
          dense
          label="From"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="(item) => item === null ? null : item.id"
          @input="newTrans.from = $event.id"
          style="width:100%"
          use-input
          @filter="filterBudgets"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-show="newTrans.category === 'Journal'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="newTrans.to > '' ? budgets[newTrans.to] ? budgets[newTrans.to].label : accounts[newTrans.to].label: ''"
          dense
          label="To"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="(item) => item === null ? null : item.id"
          @input="newTrans.to = $event.id"
          style="width:100%"
          use-input
          @filter="filterBudgets"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
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
        <q-input v-model="newTrans.GST" dense :label="'GST ('+this.project.currency+')'" type="number" v-show="newTrans.category !== 'Journal'" />
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
        budget: '',
        from: '',
        to: '',
        type: 'Cash',
        date: '',
        amount: '',
        GST: '',
        cheque: '',
        receipt: false,
        desc: '',
        category: 'Expense',
        reviewed: false
      },
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card'],
      categoryOptions: ['Expense', 'Income', 'Journal'],
      transRef: {},
      readOnly: false,
      uploading: false,
      budgetsFiltered: []
    }
  },
  created () {
    this.transRef = firebase.firestore().collection(`/projects/${this.projectId}/transactions`).doc()
    let date = new Date()
    this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
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
        budget: '',
        type: 'Cash',
        date: '',
        amount: '',
        GST: '',
        cheque: '',
        receipt: false,
        desc: '',
        category: 'Expense',
        reviewed: false
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
    },
    filterBudgets (val, update) {
      let budgets = this.isAdmin ? this.budgetOptions : this.contributorBudgets
      // console.log(budgets)
      if (val === '') {
        update(() => {
          this.budgetsFiltered = budgets
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.budgetsFiltered = budgets.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'accounts',
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
