<template>
  <q-page padding>
    <!-- {{budgetCategories}} -->
    <q-table
      class="my-sticky-header-table"
      :data="transactionsFiltered"
      :columns="columns"
      :rows-per-page-options="[5,10,15,20,50,100,200]"
      row-key="name"
      :visible-columns="visibleColumns"
      :filter="filter"
      rows-per-page-label="Transactions per page:"
      :pagination.sync="pagination"
      dense
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title"> Transactions{{ pageLabel > '' ? ' for ' + pageLabel : ''}} </div>

        <q-space />

        <!-- <div v-if="$q.screen.gt.xs" class="col">
          <q-toggle v-for="column in columns" v-model="visibleColumns" :val="column.name" :label="column.label" :key="column.name" />
        </div>
 -->    <q-select
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

        <q-input borderless dense v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-toggle
          v-model="showArchived"
          color="secondary"
          label="Show Archive"
        />

        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold" :class="{ 'bg-red-2': props.row.deleted}">
          <q-td key="number" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="icon" :props="props" class="cursor-pointer">
            <!-- {{props.row.type}} -->
            <q-icon v-if="props.row.type === 'Cheque'" name="mdi-checkbook" size="md">
              <q-tooltip>
                Cheque
              </q-tooltip>
            </q-icon>
            <q-icon v-if="props.row.type === 'Cash'" name="mdi-cash" size="md">
              <q-tooltip>
                Cash
              </q-tooltip>
            </q-icon>
            <q-icon v-if="props.row.type === 'Internet Transfer'" name="mdi-bank-transfer" size="md">
              <q-tooltip>
                Internet Transfer
              </q-tooltip>
            </q-icon>
            <q-icon v-if="props.row.type === 'Bank Card'" name="mdi-credit-card" size="md">
              <q-tooltip>
                Bank Card
              </q-tooltip>
            </q-icon>
            <q-popup-edit v-model="props.row.type">
              <q-select :value="props.row.type" dense label="Type" :options="typeOptions" @input="updateTransaction(props.row.id, 'type', $event)" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="category" :props="props">
            <!-- {{props.row.category}} -->
            <!-- {{budgets[props.row.category].category}} -->
            <!-- {{ props.row.id }} -->
            <div v-if="props.row.category !== 'Journal'">
              {{ props.row.category !== 'Journal' ? getCategoryById(props.row.budget) : '' }}
            </div>
            <div v-if="props.row.category === 'Journal'" class="cursor-pointer">
              {{ accounts[props.row.from] ? accounts[props.row.from].label : '' }}
              {{ budgetCategories[props.row.from] ? budgetCategories[props.row.from].label : '' }}
              {{ budgets[props.row.from] ? budgets[props.row.from].label : '' }}
              <q-icon name="arrow_forward" v-if="props.row.category === 'Journal'" />
              {{ accounts[props.row.to] ? accounts[props.row.to].label : '' }}
              {{ budgetCategories[props.row.to] ? budgetCategories[props.row.to].label : '' }}
              {{ budgets[props.row.to] ? budgets[props.row.to].label : '' }}
              <q-popup-edit v-model="props.row.from">
                <q-select :value="getCategoryById(props.row.from)" @input="updateBudget(props.row.id, 'from', $event)" dense autofocus label="From" stack-label :options="budgetOptions" />
                <q-select :value="getCategoryById(props.row.to)" @input="updateBudget(props.row.id, 'to', $event)" dense autofocus label="To" stack-label :options="budgetOptions" />
              </q-popup-edit>
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                <q-icon name="edit"/>
                Edit
              </q-tooltip>
            </div>
          </q-td>
          <q-td key="budget" :props="props" class="cursor-pointer">
            <!-- {{ props.row.text }} -->
            <div v-if="props.row.category === 'Expense'">
              {{ budgets[props.row.budget] ? budgets[props.row.budget].label : '' }}
              <q-popup-edit v-model="props.row.budget">
                <q-select
                  :value="budgets[props.row.budget] > '' ? budgets[props.row.budget].label : ''"
                  @input="updateTransaction(props.row.id, 'budget', $event.id)"
                  dense autofocus
                  label="Budget Category"
                  :options="budgetOptions"
                />
              </q-popup-edit>
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                <q-icon name="edit"/>
                Edit
              </q-tooltip>
            </div>
            <div v-if="props.row.category === 'Income'">
              <!-- {{ props.row.budget }} -->
              {{ budgets[props.row.budget] ? budgets[props.row.budget].label : accounts[props.row.budget] ? accounts[props.row.budget].label : '' }}
              <q-popup-edit v-model="props.row.budget">
                <q-select
                  :value="budgets[props.row.budget] > '' ? budgets[props.row.budget].label : ''"
                  @input="updateTransaction(props.row.id, 'budget', $event.id)"
                  dense autofocus
                  label="Budget Category"
                  :options="budgetOptions"
                />
              </q-popup-edit>
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                <q-icon name="edit"/>
                Edit
              </q-tooltip>
            </div>
          </q-td>
          <q-td key="date" :props="props" class="cursor-pointer">
            {{ props.row.date }}
            <q-popup-edit v-model="props.row.date">
              <!-- <q-date
                v-model="props.row.date"
                dense
                minimal
                label="Date"
              /> -->
              <q-date :value="props.row.date" @input="updateTransaction(props.row.id, 'date', $event)"  mask="DD/MM/YYYY" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="amount" :props="props" :class="{ 'text-red-8': props.row.category === 'Expense', 'text-green-8': props.row.category === 'Income','text-blue-8': props.row.category === 'Journal', }"  class="cursor-pointer">
            <!-- {{ getAmount(props.row.text) }} -->
            <!-- {{props.row}} -->
            {{ props.row.amount }}
            <q-popup-edit v-model="props.row.amount">
              <q-input :value="props.row.amount" @input="updateTransaction(props.row.id, 'amount', $event)" dense autofocus :label="'Amount ('+project.currency+')'" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="GST" :props="props" class="cursor-pointer">
            <!-- {{ getGST(props.row.text) }} -->
            {{ props.row.GST }}
            <q-popup-edit v-model="props.row.GST">
              <q-input :value="props.row.GST" @input="updateTransaction(props.row.id, 'GST', $event)" dense autofocus label="GST" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="desc" :props="props" class="cursor-pointer">
            {{ props.row.desc }}
            <q-popup-edit v-model="props.row.desc">
              <q-input :value="props.row.desc" @input="updateTransaction(props.row.id, 'desc', $event)"  dense autofocus label="Description" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="cheque" :props="props" class="cursor-pointer">
            {{ props.row.cheque }}
            <q-popup-edit v-model="props.row.cheque">
              <q-input :value="props.row.cheque" @input="updateTransaction(props.row.id, 'cheque', $event)" dense autofocus label="Cheque #" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="reviewed" :props="props">
            <!-- {{props.row.deleted}} -->
            <q-btn icon="check" round :color="props.row.reviewed ? 'positive' : ''" @click="updateTransaction(props.row.id, 'reviewed', !props.row.reviewed)" outline dense/>
            <!-- <q-checkbox :value="props.row.reviewed" @input="updateTransaction(props.row.id, 'reviewed', $event)" /> -->
          </q-td>
          <q-td key="receipt" :props="props">
            <!-- <a :href="props.row.receipt">Receipt</a> -->
            <!-- {{getReceipt('the-speaker-grill-small')}} -->
            <sp-receipt :id="props.row.id" :label="props.row.id" :url="props.row.receiptURL" v-if="props.row.receiptURL > '' ? props.row.receiptURL.startsWith('https://') : false"/>
            <!-- <q-inner-loading :showing="!props.row.receiptURL"> -->
              <q-spinner-gears size="30px" color="primary" v-if="!props.row.receiptURL" />
            <!-- </q-inner-loading> -->
            <!-- {{props.row.receiptURL.startsWith('https://')}} -->
          </q-td>
          <q-td key="delete" :props="props" auto-width>
            <q-btn
              :value="props.row.deleted ? props.row.deleted : false"
              @click="updateTransaction(props.row.id, 'deleted', !props.row.deleted)"
              icon="archive"
              dense
              class="q-mr-sm"
            >
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                <q-icon name="archive"/>
                Archive
              </q-tooltip>
            </q-btn>
            <!-- {{props.row.deleted}} -->
            <sp-delete-btn dense :docRef="`/projects/${project.id}/transactions/${props.row.id}`" class="q-mr-sm"/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary">
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Transaction
        </q-tooltip>
        <q-menu v-close-popup persistent>
          <!-- <q-scroll-area> -->
          <sp-trans-form :projectId="project.id" />
          <!-- </q-scroll-area> -->
        </q-menu>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { debounce } from 'quasar'
import firebase from 'firebase/app'
require('firebase/firestore')

import { mapGetters, mapActions } from 'vuex'

var cc = require('currency-codes')

export default {
  data () {
    return {
      columns: [
        { name: 'number', label: 'Transaction ID', field: 'number', align: 'center', sortable: true },
        { name: 'icon', label: 'Type', field: 'icon', align: 'center' },
        { name: 'category', label: 'Category', field: 'category', align: 'center', sortable: true },
        { name: 'budget', label: 'Account', field: 'budget', align: 'center', sortable: true },
        { name: 'date', label: 'Date', field: 'date', align: 'center', sortable: true },
        { name: 'amount', label: `Amount (currency)`, field: 'amount', align: 'center', sortable: true },
        { name: 'GST', label: `GST (currency)`, field: 'GST', align: 'center', sortable: true },
        { name: 'desc', label: 'Description', field: 'desc', align: 'center', sortable: true },
        { name: 'cheque', label: 'Cheque #', field: 'cheque', align: 'center', sortable: true },
        { name: 'reviewed', label: 'Reviewed', field: 'reviewed', align: 'center', sortable: true },
        { name: 'receipt', label: 'Receipt', field: 'receipt', align: 'center' },
        { name: 'delete', label: 'Delete', field: 'delete', align: 'center' }
      ],
      filter: '',
      ccOptions: [],
      visibleColumns: ['icon', 'date', 'amount', 'GST', 'type', 'category', 'budget', 'desc', 'reviewed'],
      pagination: {
        sortBy: 'date',
        descending: true,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      showArchived: false,
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']
    }
  },
  created () {
    console.log(this.project.currency)
    if (this.project.currency) {
      for (var key in this.columns) {
        if (this.columns[key].label.search('(currency)') !== -1) {
          this.columns[key].label = this.columns[key].label.replace('(currency)', `(${this.project.currency})`)
        }
      }
    }

    this.updateTransaction = debounce(this.updateTransaction, 1000)
  },
  methods: {
    ...mapActions([
      'updateTransactionByKey'
    ]),
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
    },
    getCategoryById (id) {
      if (this.budgets[id]) {
        return this.budgetCategories[this.budgets[id].category].label
      } else if (this.budgetCategories[id]) {
        return this.budgetCategories[id].label
      } else {
        return ''
      }
    },
    getAmount (text) {
      if (text > '') {
        let totalFound = false
        // let amountFound
        let textArray = text.split('\n').join(' ').split(' ')
        // console.log(textArray.length)
        for (var key in textArray) {
          // console.log(key, textArray[key].toLowerCase())
          if ((textArray[key].toLowerCase().indexOf('total') !== -1) && !(textArray[key].toLowerCase().indexOf('subtotal') !== -1)) {
            // console.log(key + 1)
            totalFound = true
            // console.log(textArray[key] + textArray[(parseInt(key) + 1)] + textArray[(parseInt(key) + 2)])
          }
          if (totalFound && textArray[key].indexOf('$') !== -1) {
            return parseFloat(textArray[key].split('$').join(''))
          }
        }
      }
    },
    getGST (text) {
      if (text > '') {
        let totalFound = false
        // let amountFound
        let textArray = text.split('\n').join(' ').split(' ')
        // console.log(textArray.length)
        for (var key in textArray) {
          // console.log(key, textArray[key].toLowerCase())
          if ((textArray[key].toLowerCase().indexOf('gst') !== -1) || (textArray[key].toLowerCase().indexOf('tax') !== -1)) {
            // console.log(key + 1)
            totalFound = true
            // console.log(textArray[key] + textArray[(parseInt(key) + 1)] + textArray[(parseInt(key) + 2)])
          }
          if ((totalFound || !totalFound) && textArray[key].indexOf('$') !== -1) {
            console.log(key, textArray[key].toLowerCase())
            // return parseFloat(textArray[key].split('$').join(''))
          }
        }
      }
    },
    updateTransaction (trans, key, val) {
      console.log(trans, key, val)
      this.updateTransactionByKey({ trans, key, val })
      firebase.firestore().collection(`/projects/${this.project.id}/transactions`).doc(trans)
        .update({ [key]: val })
        .then(() => {
          console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Transaction Updated'
          })
        }).catch(err => {
          console.log(err)
        })
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'idToken',
      'transactions',
      'accounts',
      'budgets',
      'budgetOptions',
      'budgetCategories'
    ]),
    transactionsFiltered () {
      let transactions = []
      // check if the budget filter exists
      if (this.$route.params.budgetCategory) {
        let budgets = []
        // check if the filter is a category
        if (this.budgetCategories[this.$route.params.budgetCategory]) {
          // the filter is a category
          // find all budgets in the category
          for (var key in this.budgets) {
            // check if the category
            if (this.budgets[key].category === this.$route.params.budgetCategory) {
              // console.log('Pushing', key)
              // add the budget to the array of budgets
              budgets.push(key)
            }
          }
        } else {
          // the filter is not a category
          // add the budget to the array of budgets
          budgets = [this.$route.params.budgetCategory]
        }

        // find all transactions in the budgets
        for (var transKey in this.transactions) {
          // check if the transaction exists in the budgets array
          if (budgets.includes(this.transactions[transKey].budget)) {
            // check it's not archieved and if it is archieve check if the archive is showing
            if (!this.transactions[transKey].deleted || (this.transactions[transKey].deleted && this.showArchived)) {
              // add the transactions to the transaction array
              transactions.push(this.transactions[transKey])
            }
          }
        }
      } else {
        // find all transactions in the budgets
        for (transKey in this.transactions) {
          // check it's not archieved and if it is archieve check if the archive is showing
          // console.log(this.transactions[transKey].id, !this.transactions[transKey].deleted, , this.showArchived)
          if (!this.transactions[transKey].deleted || (this.transactions[transKey].deleted && this.showArchived)) {
            // add the transactions to the transaction array
            transactions.push(this.transactions[transKey])
          }
        }
      }
      return transactions
    },
    pageLabel () {
      let category = this.$route.params.budgetCategory
      return category > '' ? this.budgets[category] ? this.budgets[category].label : this.budgetCategories[category].label : ''
    }
  },
  watch: {
    project (oldVal, newVal) {
      console.log(this.project.currency)
      for (var key in this.columns) {
        if (this.columns[key].label.search('(currency)') !== -1) {
          this.columns[key].label = this.columns[key].label.replace('(currency)', `(${this.project.currency})`)
        }
      }
    }
  },
  components: {
    'sp-trans-form': () => import('../components/sp-trans-form.vue'),
    'sp-receipt': () => import('../components/sp-receipt.vue'),
    'sp-delete-btn': () => import('../components/sp-delete-btn.vue')
  }
}
</script>
