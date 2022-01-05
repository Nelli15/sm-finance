<template>
  <q-page>
    <q-banner
      class="bg-info text-center q-mb-md"
      rounded
      v-if="budget && budget.type === 'budget'"
    >
      <span class="q-mr-lg">
        <b>Category:</b> {{ budgetCategories[budget.category].label }}
      </span>
      <span class="q-mr-lg">
        <b>Budget: </b>
        {{ budget.label }}
      </span>
      <span class="q-mr-lg">
        <b>Budgeted: </b>
        <q-badge class="bg-black" :label="'$' + budget.budget" />
      </span>
      <span class="q-mr-lg">
        <b>Spent: </b>
        <q-badge class="bg-red-8" :label="'$' + budget.expenses" />
      </span>
      <span class="q-mr-lg">
        <b>Cash in Hand: </b>
        <q-badge
          :class="{
            'bg-green-8': budget.balance > 0.01,
            'bg-red-8': budget.balance < -0.01,
            'bg-black':
              (budget.balance < 0.01 && budget.balance > -0.01) ||
              !budget.balance,
          }"
          :label="'$' + (budget.balance ? budget.balance : 0)"
        />
      </span>
    </q-banner>
    <q-banner
      class="bg-secondary text-white text-center q-mb-md"
      rounded
      v-if="budget && budget.type === 'account'"
    >
      <span class="q-mr-lg"> <b>Account: </b> {{ budget.label }} </span>
      <span class="q-mr-lg">
        <b>Balance: </b>
        <q-badge
          :class="{
            'bg-green-8': budget.balance > 0.01,
            'bg-red-8': budget.balance < -0.01,
            'bg-black':
              (budget.balance < 0.01 && budget.balance > -0.01) ||
              !budget.balance,
          }"
          :label="'$' + (budget.balance ? budget.balance : 0)"
        />
      </span>
    </q-banner>
    <q-banner
      class="bg-secondary text-white text-center q-mb-md"
      rounded
      v-if="budget && budget.type === 'category'"
    >
      <span class="q-mr-lg"> <b>Category: </b> {{ budget.label }} </span>
      <span class="q-mr-lg">
        <b>Budgeted: </b>
        <q-badge class="bg-black" :label="'$' + budget.budget" />
      </span>
      <span class="q-mr-lg">
        <b>Spent: </b>
        <q-badge class="bg-red-8" :label="'$' + budget.expenses" />
      </span>
      <span class="q-mr-lg">
        <b>Cash in Hand: </b>
        <q-badge
          :class="{
            'bg-green-8': budget.balance > 0.01,
            'bg-red-8': budget.balance < -0.01,
            'bg-black':
              (budget.balance < 0.01 && budget.balance > -0.01) ||
              !budget.balance,
          }"
          :label="'$' + (budget.balance ? budget.balance : 0)"
        />
      </span>
    </q-banner>
    <transactions-table
      :transactions="transactions"
      @onTransUpdate="updateTrans"
      :showReviewed="$route.params.budgetCategory ? true : false"
    />
    <actionsStickyFAB/>
    <div style="min-height: 60px" />
  </q-page>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { updateTransactionByKey } from '../scripts/transactions.js'

var cc = require('currency-codes')

export default {
  data() {
    return {
      ccOptions: [],
    }
  },
  preFetch({ store, currentRoute }) {
    store.dispatch('actions/fetchActions', currentRoute.params.id)
    store.dispatch('transactions/fetchTransactions', currentRoute.params.id)
    store.dispatch('auth/fetchContributors', currentRoute.params.id)
  },
  created() {},
  methods: {
    ...mapActions('transactions', ['updateTransactionByKey']),
    ...mapMutations(['clearListeners']),
    updateTrans({ trans, key, val }) {
      if (
        key === 'GST' &&
        val >
          this.transactions[
              this.transactions.findIndex((x) => x.id === trans)
            ].amount
           *
            0.1
      ) {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'GST must be <= Amount',
        })
        return
      }

      this.updateTransactionByKey({ transId: trans, key, val })
      updateTransactionByKey(this.project.id, trans, key, val)
        .then(() => {
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Transaction: Updated Successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('budgets', [
      'accounts',
      'budgets',
      'budgetOptions',
      'budgetCategories',
    ]),
    ...mapGetters('auth', ['idToken']),
    ...mapGetters('transactions', ['transactions']),
    budget() {
      if (this.$route.params.budgetCategory) {
        if (this.budgetCategories[this.$route.params.budgetCategory]) {
          return this.budgetCategories[this.$route.params.budgetCategory]
        } else if (this.accounts[this.$route.params.budgetCategory]) {
          return this.accounts[this.$route.params.budgetCategory]
        } else {
          return this.budgets[this.$route.params.budgetCategory]
        }
      } else {
        return false
      }
    },
    budgetsAndAccounts() {
      return { ...this.accounts, ...this.budgets }
    },
  },
  // beforeDestroy() {
  //   this.$store.commit('clearListeners', {})
  // },
  components: {
    'transactions-table': defineAsyncComponent(() =>
      import('../components/transactionsTable.vue')
    ),
    actionsStickyFAB: defineAsyncComponent(() =>
      import('./../components/actionsStickyFAB.vue')
    ),
  },
}
</script>

<style lang="sass">
.my-sticky-header-table
  /* max height is important */
  .q-table__middle
    max-height: 100%

  .q-table__top,
  .q-table__bottom,
  /*thead tr:first-child th*/
    /* bg color is important for th; just specify one */
    /*background-color: #c1f4cd*/

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
