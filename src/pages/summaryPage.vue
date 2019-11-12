<template>
  <q-page padding>
    <q-banner class="bg-secondary text-white text-center" rounded>
      <div class="text-h4">{{ project.name }}</div>
      <div class="text-subtitle1  q-pb-md">{{ project.number }}</div>
      <div class="text-h6">{{ project.participants }} Participants</div>
      <div class="text-subtitle-1">Project Currency ({{ project.currency }})</div>
    </q-banner>

    <q-table
      class="my-sticky-header-table"
      :data="accountsFiltered"
      :columns="accountColumns"
      title="Accounts"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="'accounts'+tableKey"
      :filter="accountsFilter"
      rows-per-page-label="Accounts per page:"
      :pagination.sync="accountsPagination"
      dense
      @update:pagination="$q.localStorage.set('accountsTableRows', $event.rowsPerPage)"
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">Accounts</div>

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
          <q-td key="label" :props="props" class="cursor-pointer">
            {{ props.row.label }}
            <q-popup-edit v-model="props.row.label">
              <q-input :value="props.row.label > '' ? props.row.label : ''" @input="updateCategory(props.row.id, 'label', $event)" dense autofocus label="Budget Label" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="income" :props="props" class="text-positive">
            <!-- {{props.row.budget}} -->
            ${{ props.row.income.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip>
          </q-td>
          <q-td key="expenses" :props="props" class="text-negative">
            ${{ props.row.expenses.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip>
          </q-td>
          <q-td key="balance" :props="props">
            <q-badge :class="{ 'bg-green-8': (props.row.income - props.row.expenses) > 0, 'bg-red-8': (props.row.income - props.row.expenses) < 0, 'bg-black': (props.row.income - props.row.expenses) == 0 }" :label="'$'+(props.row.income - props.row.expenses).toFixed(2)" />
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip>
          </q-td>
          <q-td key="actions" :props="props">
            <q-toggle :value="props.row.inHeader">
              <q-tooltip content-class="bg-accent text-black">
                View in Header
              </q-tooltip>
            </q-toggle>
            <!-- <q-btn :to="'budget/'+props.row.id" dense class="q-mr-sm">Budgets</q-btn> -->
            <q-btn :to="'transactions/'+props.row.id" dense class="q-mr-sm">Transactions</q-btn>
            <q-btn v-if="props.row.inUse" dense color="negative">
              <q-icon name="delete_forever"/>
              <q-tooltip content-class="bg-accent text-black">
                Cannot Delete Budget while in use
              </q-tooltip>
            </q-btn>
            <sp-delete-btn dense v-if="!props.row.inUse" :docRef="`/projects/${project.id}/transactions/${props.row.id}`"/>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-table
      class="my-sticky-header-table"
      :data="budgetCategoriesFiltered"
      :columns="columns"
      title="Budget Categories"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="'budgets'+tableKey"
      :filter="filter"
      rows-per-page-label="Budgets per page:"
      :pagination.sync="pagination"
      dense
      @update:pagination="$q.localStorage.set('summaryTableRows', $event.rowsPerPage)"
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">Categories</div>

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
          <q-td key="label" :props="props" class="cursor-pointer">
            {{ props.row.label }}
            <q-popup-edit v-model="props.row.label">
              <q-input :value="props.row.label > '' ? props.row.label : ''" @input="updateCategory(props.row.id, 'label', $event)" dense autofocus label="Budget Label" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="budgeted" :props="props">
            <!-- {{props.row.budget}} -->
            ${{ props.row.budget.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
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
          <q-td key="actions" :props="props">
            <q-btn :to="'budget/'+props.row.id" dense class="q-mr-sm">Budgets</q-btn>
            <q-btn :to="'transactions/'+props.row.id" dense class="q-mr-sm">Transactions</q-btn>
            <q-btn v-if="props.row.inUse" dense color="negative">
              <q-icon name="delete_forever"/>
              <q-tooltip content-class="bg-accent text-black">
                Cannot Delete Budget while in use
              </q-tooltip>
            </q-btn>
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
        <q-menu ref="addCategoryMenu" persistent>
          <!-- <q-scroll-area> -->
          <sp-budget-form :projectId="$route.params.id" @onSubmit="$refs.addCategoryMenu.hide()"/>
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
  { name: 'label', align: 'left', label: 'Label', field: 'label', sortable: true },
  { name: 'budgeted', align: 'center', label: 'Budgeted (AUD)', field: 'budgeted', sortable: true },
  { name: 'spent', align: 'center', label: 'Spent (AUD)', field: 'spent', sortable: true },
  { name: 'remaining', align: 'center', label: 'Cash in Hand (AUD)', field: 'remaining', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

const accountColumns = [
  { name: 'label', align: 'left', label: 'Label', field: 'label', sortable: true },
  { name: 'income', align: 'center', label: 'In (AUD)', field: 'income', sortable: true },
  { name: 'expenses', align: 'center', label: 'Out (AUD)', field: 'expenses', sortable: true },
  { name: 'balance', align: 'center', label: 'Balance (AUD)', field: 'balance', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

export default {
  data () {
    return {
      columns,
      accountColumns,
      filter: '',
      accountsFilter: '',
      visibleColumns: ['label', 'budgeted', 'spent', 'remaining', 'actions'],
      accountsVisibleColumns: ['label', 'budgeted', 'spent', 'remaining', 'actions'],
      pagination: {
        sortBy: 'label',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      accountsPagination: {
        sortBy: 'label',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      }
      // project: {
      //   name: 'Gold Coast Schoolies',
      //   id: '12345',
      //   participants: 40,
      //   currency: 'AUD'
      // }
    }
  },
  created () {
    this.updateCategory = debounce(this.updateCategory, 1000)
    this.pagination.rowsPerPage = this.$q.localStorage.getItem('summaryTableRows')
    this.accountsPagination.rowsPerPage = this.$q.localStorage.getItem('accountsTableRows')
  },
  methods: {
    ...mapActions([
      'updateCategoryByKey'
    ]),
    updateCategory (budgetId, key, val) {
      // console.log(budgetId, key, val)
      this.updateCategoryByKey({ budgetId, key, val })
      firebase.firestore().collection(`/projects/${this.project.id}/accounts`).doc(budgetId)
        .update({ [key]: val })
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Category: Updated Successfully'
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
      'budgetCategories',
      'accounts',
      'tableKey'
    ]),
    budgetCategoriesFiltered () {
      let budgetCategories = []
      for (var category in this.budgetCategories) {
        // console.log(category)
        budgetCategories.push(this.budgetCategories[category])
      }
      return budgetCategories
    },
    accountsFiltered () {
      let accounts = []
      for (var account in this.accounts) {
        // console.log(category)
        accounts.push(this.accounts[account])
      }
      return accounts
    }
  },
  components: {
    'sp-budget-form': () => import('./../components/sp-budget-form.vue'),
    'sp-delete-btn': () => import('../components/sp-delete-btn.vue')
  }
}
</script>
