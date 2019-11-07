<template>
  <q-form
      @reset="onReset"
      @submit="onSubmit">
    <q-list style="min-width: 100px;min-height:360px;">
      <q-item class="text-h6 justify-center">
        <!-- <q-item-section> -->
          Add Account
        <!-- </q-item-section> -->
      </q-item>
      <q-item>
        <q-btn-toggle
          v-model="newBudget.type"
          toggle-color="primary"
          :options="[
            {label: 'Budget', value: 'budget'},
            {label: 'Category', value: 'category'},
            {label: 'Account', value: 'account'}
          ]"
          style="width:100%"
          push
          dense
        />
      </q-item>
      <q-item>
        <q-input v-model="newBudget.label" label="Budget Label" stack-label  style="width:100%"/>
      </q-item>
      <q-item v-if="newBudget.type === 'budget'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
          <q-select :value="newBudget.category > '' ? budgets[newBudget.category] ? budgets[newBudget.category].label : budgetCategories[newBudget.category].label: ''" dense label="Category" stack-label :options="budgetCategoryOptions" option-label="label" :option-value="(item) => item === null ? null : item.id" @input="newBudget.category = $event.id" style="width:100%"/>
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-if="newBudget.type === 'budget'">
        <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
            <q-input v-model="newBudget.budget" dense label="Budget" stack-label type="number" style="width:100%" :rules="[val => !!val || 'Field is Required!']" />
          <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item class="absolute-bottom q-mb-sm">
          <q-btn label="Submit" type="submit" color="secondary"/>
          <q-btn label="Clear" type="reset" color="secondary" flat class="q-ml-sm"/>
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
      newBudget: {
        category: '', // ID
        type: 'budget', // ['budget', 'category', 'account']
        label: '', // name of budget or category
        budget: 0 // the amount budgeted
      },
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
      this.$q.loading.show()
      // console.log(`/projects/${this.projectId}/budgets`)
      let newBudgetRef = firebase.firestore().collection(`/projects/${this.projectId}/accounts`).doc()
      console.log(newBudgetRef)
      newBudgetRef.set(this.newBudget).then(res => {
        this.$q.loading.hide()
      }).catch(err => {
        console.log(err)
        this.$q.loading.hide()
      })
      // this.loading = false
    },
    onReset (event) {

    }
  },
  computed: {
    ...mapGetters([
      'budgets',
      'budgetCategories',
      'budgetOptions',
      'budgetCategoryOptions'
    ])
  }
}
</script>
