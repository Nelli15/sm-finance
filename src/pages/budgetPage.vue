<template>
  <q-page padding>
    <q-page-sticky position="bottom-right" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary" >
        Andy Might only be able to accept a few categories like on the MMR/MFB Form, we should check this
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Budget
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-table
      :data="budgets"
      :columns="columns"
      title="Budget"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="tableKey"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="category" :props="props">
            {{ props.row.category }}
            <!-- <q-popup-edit v-model="props.row.category">
              <q-input v-model="props.row.category" dense autofocus counter label="Budget Category" />
            </q-popup-edit> -->
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
            <q-btn :to="'transactions/'+props.row.category" flat>View Transations</q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

const columns = [
  { name: 'category', align: 'left', label: 'Category', field: 'category' },
  { name: 'budgeted', align: 'center', label: 'Budgeted (AUD)', field: 'budgeted' },
  { name: 'spent', label: 'Spent (AUD)', field: 'spent' },
  { name: 'remaining', label: 'Remaining (AUD)', field: 'remaining' },
  { name: 'transactions', label: 'Transactions', field: 'category' }
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
      columns
    }
  },
  created () {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  computed: {
    ...mapGetters([
      'budgets',
      'tableKey'
    ])
  }
}
</script>
