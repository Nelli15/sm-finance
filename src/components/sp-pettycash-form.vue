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
					<q-btn label="Submit" type="submit" color="teal"/>
					<q-btn label="Clear" type="reset" color="teal" flat class="q-ml-sm"/>
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
