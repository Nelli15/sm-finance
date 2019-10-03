<template>
  <q-page padding>
    <q-page-sticky position="bottom-right" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary" >
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Transation
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-table
      :data="transactionsFiltered"
      :columns="columns"
      :rows-per-page-options="[5,10,15,20]"
      row-key="name"
      :visible-columns="visibleColumns"
      :filter="filter"
      rows-per-page-label="TRANSACTIONS PER PAGE"
    >
      <template v-slot:top="props">
        <div class="col-2 q-table__title"> Transactions</div>

        <q-space />

        <!-- <div v-if="$q.screen.gt.xs" class="col">
          <q-toggle v-for="column in columns" v-model="visibleColumns" :val="column.name" :label="column.label" :key="column.name" />
        </div>
 -->        <q-select
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
        />

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
          <q-td key="icon" :props="props">
            <q-icon v-if="props.row.type === 'Cheque'" name="mdi-checkbook" size="md" />
            <q-icon v-if="props.row.type === 'Cash'" name="mdi-cash" size="md" />
            <q-icon v-if="props.row.type === 'Internet Transfer'" name="mdi-bank-transfer" size="md" />
            <q-icon v-if="props.row.type === 'Bank Card'" name="mdi-credit-card" size="md" />
          </q-td>
          <q-td key="number" :props="props">
            <!-- {{props.row.type}} -->

            {{ props.row.number }}
            <q-popup-edit v-model="props.row.number">
              <q-input v-model="props.row.number" dense autofocus counter label="Transaction Number" />
            </q-popup-edit>
          </q-td>
          <q-td key="date" :props="props">
            {{ props.row.date }}
            <q-popup-edit v-model="props.row.date" title="Date">
              <q-date
                v-model="props.row.date"
                dense
                minimal
                label="Date"
              />
            </q-popup-edit>
          </q-td>
          <q-td key="international" :props="props">
            <q-checkbox :value="props.row.currency !== 'AUD'" disabled/>
          </q-td>
          <q-td key="amountAUD" :props="props">
            {{ props.row.amountAUD }}
            <q-popup-edit v-model="props.row.amountAUD">
              <q-input v-model="props.row.amountAUD" dense autofocus label="Amount (AUD)" />
            </q-popup-edit>
          </q-td>
          <q-td key="GST" :props="props">
            {{ props.row.GST }}
            <q-popup-edit v-model="props.row.GST">
              <q-input v-model="props.row.GST" dense autofocus label="GST" />
            </q-popup-edit>
          </q-td>
          <q-td key="currency" :props="props">
            {{ props.row.currency }}
            <q-popup-edit v-model="props.row.currency">
              <q-select v-model="props.row.currency" :options="ccOptions" dense autofocus use-input @filter="filterFn" label="Currency">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                    No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-popup-edit>
          </q-td>
          <q-td key="amountInt" :props="props">
            {{ props.row.amountInt }}
            <q-popup-edit v-model="props.row.amountInt">
              <q-input v-model="props.row.amountInt" dense autofocus label="Amount (Int)" />
            </q-popup-edit>
          </q-td>
          <q-td key="type" :props="props">
            {{ props.row.type }}
            <q-popup-edit v-model="props.row.type">
              <q-select v-model="props.row.type" :options="typeOptions" dense autofocu label="Type" />
            </q-popup-edit>
          </q-td>
          <q-td key="category" :props="props">
            {{ props.row.category }}
            <q-popup-edit v-model="props.row.category">
              <q-select v-model="props.row.category" dense autofocus label="Category" :options="budgets" option-label="category" option-value="category" />
            </q-popup-edit>
          </q-td>
          <q-td key="cheque" :props="props">
            {{ props.row.cheque }}
            <q-popup-edit v-model="props.row.cheque">
              <q-input v-model="props.row.cheque" dense autofocus label="Cheque #" />
            </q-popup-edit>
          </q-td>
          <q-td key="desc" :props="props">
            {{ props.row.desc }}
            <q-popup-edit v-model="props.row.desc">
              <q-input v-model="props.row.desc" dense autofocus label="Description" />
            </q-popup-edit>
          </q-td>
          <q-td key="deleted" :props="props">
            <q-checkbox v-model="props.row.deleted"/>
          </q-td>
          <q-td key="receipt" :props="props">
            <a :href="props.row.receipt">Receipt</a>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
// import firebase from 'firebase/app'
// require('firebase/firestore')

import { mapGetters } from 'vuex'

const columns = [
  { name: 'icon', label: '', field: 'icon', align: 'center' },
  { name: 'number', label: 'Transaction Number', field: 'number', align: 'center', sortable: true },
  { name: 'date', label: 'Date', field: 'date', align: 'center', sortable: true },
  { name: 'international', label: 'International?', field: 'international', align: 'center', sortable: true },
  { name: 'amountAUD', label: 'Amount (AUD)', field: 'amountAUD', align: 'center', sortable: true },
  { name: 'GST', label: 'GST (AUD)', field: 'GST', align: 'center', sortable: true },
  { name: 'currency', label: 'Currency', field: 'currency', align: 'center', sortable: true },
  { name: 'amountInt', label: 'Amount (Int)', field: 'amountInt', align: 'center', sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'center', sortable: true },
  { name: 'category', label: 'Budget Category', field: 'category', align: 'center', sortable: true },
  { name: 'cheque', label: 'Cheque #', field: 'cheque', align: 'center', sortable: true },
  { name: 'desc', label: 'Description', field: 'desc', align: 'center', sortable: true },
  { name: 'deleted', label: 'Deleted', field: 'deleted', align: 'center', sortable: true },
  { name: 'receipt', label: 'Receipt', field: 'receipt', align: 'center' }
]

var cc = require('currency-codes')

export default {
  data () {
    return {
      columns,
      filter: '',
      ccOptions: [],
      visibleColumns: ['icon', 'number', 'date', 'amountAUD', 'GST', 'type', 'category', 'cheque', 'desc', 'receipt'],
      typeOptions: [{
        label: 'Cash',
        value: 'cash'
      },
      {
        label: 'Cheque',
        value: 'cheque'
      },
      {
        label: 'Internet Transfer',
        value: 'internet'
      },
      {
        label: 'Bank Card',
        value: 'bankcard'
      }]
    }
  },
  created () {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.ccOptions = cc.codes()
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.ccOptions = cc.codes().filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  computed: {
    ...mapGetters([
      'transactions',
      'budgets'
    ]),
    transactionsFiltered () {
      if (this.$route.params.budgetCategory) {
        let transactions = []
        console.log(this.transactions)
        for (var key in this.transactions) {
          console.log(this.$route.params.budgetCategory, '===', this.transactions, key)
          if (this.$route.params.budgetCategory === this.transactions[key].category) {
            transactions.push(this.transactions[key])
          }
        }
        return transactions
      } else {
        return this.transactions
      }
    }
  },
  components: {

  }
}
</script>
