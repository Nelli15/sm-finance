<template>
  <q-page padding>
    <q-table
      class="my-sticky-header-table"
      :data="budgetsFiltered"
      :columns="columns"
      title="Budget"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="tableKey"
      :filter="filter"
      rows-per-page-label="Budgets per page:"
      :pagination.sync="pagination"
      @update:pagination="$q.localStorage.set('budgetTableRows', $event.rowsPerPage)"
      dense
    >
      <template v-slot:top="props">
        <div class="col-2 q-table__title">Budgets</div>

        <q-space />

        <!-- <div v-if="$q.screen.gt.xs" class="col">
          <q-toggle v-for="column in columns" v-model="visibleColumns" :val="column.name" :label="column.label" :key="column.name" />
        </div>
 -->    <!-- <q-select
          v-model="visibleColumns"
          multiple
          borderless
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          style="min-width: 150px"
        /> -->

        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold">
          <q-td key="category" :props="props" class="cursor-pointer">
            <!-- {{ props.row.category }} -->
            <!-- {{budgetCategories}} -->
            {{ budgetCategories[props.row.category].label }}
            <q-popup-edit v-model="props.row.category">
              <q-select :value="props.row.category > '' ? budgets[props.row.category] ? budgets[props.row.category].label : budgetCategories[props.row.category].label: ''" @input="updateBudget(props.row.id, 'category', $event.id)" dense autofocus label="Budget Category" :options="budgetCategoryOptions" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="label" :props="props" class="cursor-pointer">
            {{ props.row.label }}
            <q-popup-edit v-model="props.row.label">
              <q-input :value="props.row.label > '' ? props.row.label : ''" @input="updateBudget(props.row.id, 'label', $event)" dense autofocus label="Budget Label" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="budgeted" :props="props" class="cursor-pointer">
            ${{ parseFloat(props.row.budget).toFixed(2) }}
            <q-popup-edit v-model="props.row.budget">
              <!-- <q-input v-model="props.row.budget" dense autofocus label="Budgeted Amount"> -->
              <q-input :value="props.row.budget > '' ? props.row.budget : ''" @input="updateBudget(props.row.id, 'budget', $event)" dense autofocus label="Budgeted Amount">
                <template v-slot:prepend>
                  $
                </template>
              </q-input>
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="spent" :props="props">
            ${{ props.row.expenses.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip>
          </q-td>
          <q-td key="remaining" :props="props">
            <q-badge :class="{ 'bg-green-8': (props.row.income - props.row.expenses) > 0, 'bg-red-8': (props.row.income - props.row.expenses) < 0, 'bg-black': (props.row.income - props.row.expenses) == 0 }" :label="'$'+(props.row.income - props.row.expenses).toFixed(2)" />
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip>
          </q-td>
          <q-td key="transactions" :props="props">
            <q-btn :to="'transactions/'+props.row.id" flat>Transactions</q-btn>
          </q-td>
          <q-td key="delete" :props="props">
            <div v-if="props.row.inUse">
              IN USE
            </div>
            <sp-delete-btn dense v-if="!props.row.inUse" :docRef="`/projects/${project.id}/transactions/${props.row.id}`"/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary" direction="up">
        <q-tooltip content-class="bg-accent text-black">
          Add Account
        </q-tooltip>
        <q-menu ref="addBudgetMenu" persistent>
          <!-- <q-scroll-area> -->
          <sp-budget-form :projectId="$route.params.id" @onSubmit="$refs.addBudgetMenu.hide()"/>
          <!-- </q-scroll-area> -->
        </q-menu>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { debounce } from 'quasar'
import firebase from 'firebase/app'
require('firebase/firestore')

const columns = [
  { name: 'category', align: 'left', label: 'Category', field: 'category', sortable: true },
  { name: 'label', align: 'left', label: 'Label', field: 'label', sortable: true },
  { name: 'budgeted', align: 'center', label: 'Budgeted (AUD)', field: 'budgeted', sortable: true },
  { name: 'spent', align: 'center', label: 'Spent (AUD)', field: 'spent', sortable: true },
  { name: 'remaining', align: 'center', label: 'Cash in Hand (AUD)', field: 'remaining', sortable: true },
  { name: 'transactions', label: '', field: 'category' },
  { name: 'delete', label: 'Delete', field: 'delete', align: 'center' }
]

export default {
  data () {
    return {
      // data,
      columns,
      filter: '',
      visibleColumns: ['category', 'name', 'budgeted', 'spent', 'remaining', 'transactions', 'delete'],
      pagination: {
        sortBy: 'label',
        descending: true,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      }
    }
  },
  created () {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
    this.updateBudget = debounce(this.updateBudget, 1000)
    this.pagination.rowsPerPage = this.$q.localStorage.getItem('budgetTableRows')
  },
  methods: {
    ...mapActions([
      'updateBudgetByKey'
    ]),
    updateBudget (budgetId, key, val) {
      // console.log(budgetId, key, val)
      this.updateBudgetByKey({ budgetId, key, val })
      firebase.firestore().collection(`/projects/${this.project.id}/accounts`).doc(budgetId)
        .update({ [key]: val })
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Budget: Updated Successfully'
          })
        }).catch(err => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'budgets',
      'budgetCategories',
      'tableKey',
      'budgetOptions',
      'budgetCategoryOptions'
    ]),
    budgetsFiltered () {
      if (this.$route.params.budgetCategory) {
        let budgets = []
        // console.log(this.budgets)
        for (var key in this.budgets) {
          // console.log(this.$route.params.budgetCategory, '===', this.budgets, key)
          if (this.$route.params.budgetCategory === this.budgets[key].category) {
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
    }
  },
  components: {
    'sp-budget-form': () => import('./../components/sp-budget-form.vue'),
    'sp-delete-btn': () => import('../components/sp-delete-btn.vue')
  }
}
</script>
