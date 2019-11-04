<template>
  <q-menu>
    <q-form
    @reset="onReset"
    @submit="onSubmit">
      <q-list style="min-width: 100px">
        <q-item>
        <!-- <q-item-section> -->
        Add Pettty Cash
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
    <q-inner-loading :showing="loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
  </q-menu>
</template>

<script>
import { mapGetters } from 'vuex'
// import firebase from 'firebase/app'
// require('firebase/firestore')

export default {
  props: ['projectId'],
  data () {
    return {
      // newBudget: {
      //   category: '', // ID
      //   sub: true, // budget if true, category if false
      //   label: '', // name of budget or category
      //   budget: 0 // the amount budgeted
      // },
      loading: false
    }
  },
  created () {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  methods: {
    onSubmit (event) {
      // this.loading = true
      // this.$q.loading.show()
      // console.log(`/projects/${this.projectId}/budgets`)
      // let newBudgetRef = firebase.firestore().collection(`/projects/${this.projectId}/budgets`).doc()
      // console.log(newBudgetRef)
      // newBudgetRef.set(this.newBudget).then(res => {
      //   this.$q.loading.hide()
      // }).catch(err => {
      //   console.log(err)
      //   this.$q.loading.hide()
      // })
      // this.loading = false
    }
  },
  computed: {
    ...mapGetters([
      'budgets',
      'budgetCategories',
      'budgetOptions'
    ])
  }
}
</script>
