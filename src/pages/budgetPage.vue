<template>
  <q-page padding>
    <q-table
      :data="budgetsFiltered"
      :columns="columns"
      title="Budget"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="tableKey"
      :filter="filter"
      rows-per-page-label="Budgets per page:"
      :pagination.sync="pagination"
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
        <q-tr :props="props">
          <q-td key="category" :props="props">
            <!-- {{ props.row.category }} -->
            <!-- {{budgetCategories}} -->
            {{ budgetCategories[props.row.category].category }}
            <!-- <q-popup-edit v-model="props.row.category">
              <q-input v-model="props.row.category" dense autofocus counter label="Budget Category" />
            </q-popup-edit> -->
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.label }}
          </q-td>
          <q-td key="budgeted" :props="props">
            ${{ props.row.budget }}
            <q-popup-edit v-model="props.row.budget">
              <q-input v-model="props.row.budget" dense autofocus label="Budgeted Amount">
                <template v-slot:prepend>
                  $
                </template>
              </q-input>
            </q-popup-edit>
          </q-td>
          <q-td key="spent" :props="props">
            ${{ props.row.spent }}
          </q-td>
          <q-td key="remaining" :props="props">
            <q-badge v-if="props.row.budget - props.row.spent > 0" color="positive" :label="'$'+(props.row.budget - props.row.spent)" />
            <q-badge v-else-if="props.row.budget - props.row.spent < 0" color="negative" :label="'-$'+(props.row.budget - props.row.spent)*-1" />
            <q-badge v-else color="black" :label="'$'+(props.row.budget - props.row.spent)" />
          </q-td>
          <q-td key="transactions" :props="props">
            <q-btn :to="'transactions/'+props.row.id" flat>Transations</q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary" >
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Budget
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

const columns = [
  { name: 'category', align: 'left', label: 'Category', field: 'category', sortable: true },
  { name: 'name', align: 'left', label: 'Name', field: 'label', sortable: true },
  { name: 'budgeted', align: 'center', label: 'Budgeted (AUD)', field: 'budgeted', sortable: true },
  { name: 'spent', label: 'Spent (AUD)', field: 'spent', sortable: true },
  { name: 'remaining', label: 'Remaining (AUD)', field: 'remaining', sortable: true },
  { name: 'transactions', label: '', field: 'category' }
]

// const data = [
//   {
//     category: 'Accommodation',
//     budgeted: 100,
//     spent: 10
//   },
//   {
//     category: 'Food/Household',
//     budgeted: 100,
//     spent: 10
//   },
//   {
//     category: 'Outreach',
//     budgeted: 100,
//     spent: 10
//   },
//   {
//     category: 'Team Building',
//     budgeted: 100,
//     spent: 10
//   },
//   {
//     category: 'Travel',
//     budgeted: 100,
//     spent: 20
//   }
// ]

export default {
  data () {
    return {
      // data,
      columns,
      filter: '',
      pagination: {
        sortBy: 'category',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      }
    }
  },
  created () {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  computed: {
    ...mapGetters([
      'budgets',
      'budgetCategories',
      'tableKey'
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
  }
}
</script>
