<template>
  <q-page>
    <budgetsTable/>
    <actionsStickyFAB />
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { debounce } from 'quasar'
import { updateBudgetByKey } from './../scripts/accounts.js'
import { defineAsyncComponent } from 'vue'

const columns = [
  {
    name: 'category',
    align: 'left',
    label: 'Category',
    field: 'category',
    sortable: true,
  },
  {
    name: 'label',
    align: 'left',
    label: 'Label',
    field: 'label',
    sortable: true,
  },
  {
    name: 'budgeted',
    align: 'center',
    label: 'Budgeted (AUD)',
    field: 'budgeted',
    sortable: true,
  },
  {
    name: 'spent',
    align: 'center',
    label: 'Spent (AUD)',
    field: 'spent',
    sortable: true,
  },
  {
    name: 'remaining',
    align: 'center',
    label: 'Cash in Hand (AUD)',
    field: 'remaining',
    sortable: true,
  },
  { name: 'buttons', label: 'Actions', field: 'buttons', align: 'right' },
]

export default {
  data() {
    return {
      columns,
      filter: '',
      visibleColumns: [
        'category',
        'name',
        'budgeted',
        'spent',
        'remaining',
        'actions',
      ],
      pagination: {
        sortBy: 'label',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        // rowsNumber: xx if getting data from a server
      },
    }
  },
  preFetch({ store, currentRoute }) {
    store.dispatch('auth/fetchContributors', currentRoute.params.id)
  },
  created() {
    this.updateBudget = debounce(this.updateBudget, 1000)
    this.pagination = this.$q.localStorage.has('budgetPagination')
      ? this.$q.localStorage.getItem('budgetPagination')
      : {
          sortBy: 'label',
          descending: false,
          page: 1,
          rowsPerPage: 10,
          // rowsNumber: xx if getting data from a server
        }
  },
  methods: {
    ...mapActions('budgets', ['updateBudgetByKey']),
    updateBudget(budgetId, key, val) {
      // console.log(budgetId, key, val)
      this.updateBudgetByKey({ budgetId, key, val })
      updateBudgetByKey(this.$route.params.id, budgetId, key, val)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Budget: Updated Successfully',
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
      'budgetCategoryOptions',
      'budgets',
      'budgetCategories',
      'budgetOptions',
    ]),
    ...mapGetters('transactions', ['transactions']),
    budgetsFiltered() {
      if (this.$route.params.budgetCategory) {
        let budgets = []
        // console.log(this.budgets)
        for (var key in this.budgets) {
          // console.log(
          //   this.$route.params.budgetCategory,
          //   '===',
          //   this.budgets,
          //   key
          // )
          if (
            this.$route.params.budgetCategory === this.budgets[key].category
          ) {
            budgets.push(this.budgets[key])
          }
        }
        return budgets
      } else {
        let budgets = []
        for (var category in this.budgets) {
          // console.log(category)
          budgets.push(this.budgets[category])
        }
        return budgets
      }
    },
  },
  components: {
    actionsStickyFAB: defineAsyncComponent(() =>
      import('./../components/actionsStickyFAB.vue')
    ),
    budgetsTable: defineAsyncComponent(() =>
      import('../components/budgetsTable.vue')
    ),
  },
}
</script>
