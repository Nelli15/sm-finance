<template>
  <q-page padding>
    <!-- {{budgetCategories}} -->
    <q-table
      class="my-sticky-header-table"
      :data="myTransactionsFiltered"
      :columns="columns"
      :rows-per-page-options="[5,10,15,20,50,100,200]"
      :row-key="row => row.id"
      :visible-columns="visibleColumns"
      :filter="filter"
      :filter-method="filterMethod"
      rows-per-page-label="Transactions per page:"
      :pagination.sync="pagination"
      @update:pagination="$q.localStorage.set('transTableRows', $event.rowsPerPage)"
      selection="multiple"
      :selected.sync="rowSelected"
      dense
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title"> My Transactions{{ pageLabel > '' ? ' for ' + pageLabel : ''}} </div>

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
          icon="archive"
        >
          <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
            Show Archived
          </q-tooltip>
        </q-toggle>
        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th>
            <q-checkbox dense v-model="props.selected" />
          </q-th>
          <!-- {{columnsFiltered}} -->
          <q-th
            v-for="col in columnsFiltered"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold" :class="{ 'bg-red-2': props.row.deleted, 'bg-orange-2': props.row.deleteRequested && !props.row.deleted }" v-if="!props.row.reviewed">
          <q-td key="selected" :props="props">
            <!-- {{props.selected}} -->
            <q-checkbox v-model="props.selected" dense/>
          </q-td>
          <q-td key="number" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="icon" :props="props" >
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
          </q-td>
          <q-td key="category" :props="props">
            <!-- {{props.row.category}} -->
            <!-- {{budgets[props.row.category].category}} -->
            <!-- {{ props.row.id }} -->
            <div v-if="props.row.category !== 'Journal'">
              {{ props.row.category !== 'Journal' ? getCategoryById(props.row.budget) : '' }}
            </div>
          </q-td>
          <q-td key="budget" :props="props" >
            <!-- {{ props.row.text }} -->
            <div v-if="props.row.category === 'Expense'">
              {{ budgets[props.row.budget] ? budgets[props.row.budget].label : accounts[props.row.budget] ? accounts[props.row.budget].label : '' }}
              <q-popup-edit v-model="props.row.budget">
                <q-select
                  :value="budgets[props.row.budget] > '' ? budgets[props.row.budget].label : ''"
                  @input="updateTransaction(props.row.id, 'budget', $event.id)"
                  dense autofocus
                  label="Budget"
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
            <div v-if="props.row.category === 'Journal'" >
              {{ accounts[props.row.from] ? accounts[props.row.from].label : '' }}
              {{ budgetCategories[props.row.from] ? budgetCategories[props.row.from].label : '' }}
              {{ budgets[props.row.from] ? budgets[props.row.from].label : '' }}
              <q-icon name="arrow_forward" v-if="props.row.category === 'Journal'" />
              {{ accounts[props.row.to] ? accounts[props.row.to].label : '' }}
              {{ budgetCategories[props.row.to] ? budgetCategories[props.row.to].label : '' }}
              {{ budgets[props.row.to] ? budgets[props.row.to].label : '' }}
              <q-popup-edit v-model="props.row.from">
                <q-select v-if="accounts[props.row.from]" :value="accounts[props.row.from].label" @input="updateTransaction(props.row.id, 'from', $event.id)" dense autofocus label="From" stack-label :options="budgetOptions" />
                <q-select v-if="budgets[props.row.from]" :value="budgets[props.row.from].label" @input="updateTransaction(props.row.id, 'from', $event.id)" dense autofocus label="From" stack-label :options="budgetOptions" />
                <q-select v-if="budgetCategories[props.row.from]" :value="budgetCategories[props.row.from].label" @input="updateTransaction(props.row.id, 'from', $event.id)" dense autofocus label="From" stack-label :options="budgetOptions" />
                <q-select v-if="accounts[props.row.to]" :value="accounts[props.row.to].label" @input="updateTransaction(props.row.id, 'to', $event.id)" dense autofocus label="To" stack-label :options="budgetOptions" />
                <q-select v-if="budgets[props.row.to]" :value="budgets[props.row.to].label" @input="updateTransaction(props.row.id, 'to', $event.id)" dense autofocus label="To" stack-label :options="budgetOptions" />
                <q-select v-if="budgetCategories[props.row.to]" :value="budgetCategories[props.row.to].label" @input="updateTransaction(props.row.id, 'to', $event.id)" dense autofocus label="To" stack-label :options="budgetOptions" />
              </q-popup-edit>
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                <q-icon name="edit"/>
                Edit
              </q-tooltip>
            </div>
          </q-td>
          <q-td key="date" :props="props" >
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
          <q-td key="amount" :props="props" :class="{ 'text-red-8': props.row.category === 'Expense', 'text-green-8': props.row.category === 'Income', 'text-blue-8': props.row.category === 'Journal' }"  >
            <!-- {{ getAmount(props.row.text) }} -->
            <!-- {{props.row}} -->
            {{ parseFloat(props.row.amount).toFixed(2) }}
            <q-popup-edit v-model="props.row.amount">
              <q-input :value="props.row.amount" @input="updateTransaction(props.row.id, 'amount', $event)" dense autofocus :label="'Amount ('+project.currency+')'" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="GST" :props="props" :class="{'cursor-pointer': props.row.category !== 'Journal' }">
            <!-- {{ getGST(props.row.text) }} -->
            {{ parseFloat(props.row.GST ? props.row.GST : 0).toFixed(2) }}
            <q-popup-edit v-model="props.row.GST" v-if="props.row.category !== 'Journal'">
              <q-input :value="props.row.GST" @input="updateTransaction(props.row.id, 'GST', $event)" dense autofocus label="GST"/>
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black" v-if="props.row.category !== 'Journal'">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="desc" :props="props"  style="white-space: normal;min-width:300px">
            {{ props.row.desc }}
            <q-popup-edit v-model="props.row.desc">
              <q-input :value="props.row.desc" @input="updateTransaction(props.row.id, 'desc', $event)"  dense autofocus label="Description" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="cheque" :props="props" class="{ 'cursor-pointer': props.row.type === 'Cheque' }">
            {{ props.row.cheque }}
            <q-popup-edit v-model="props.row.cheque" v-if="props.row.type === 'Cheque'">
              <q-input :value="props.row.cheque" @input="updateTransaction(props.row.id, 'cheque', $event)" dense autofocus label="Cheque #" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black" v-if="props.row.type === 'Cheque'">
              <q-icon name="edit"/>
              Edit
            </q-tooltip>
          </q-td>
          <!-- <q-td key="reviewed" :props="props"> -->
            <!-- {{props.row.deleted}} -->
            <!-- <q-checkbox :value="props.row.reviewed" @input="updateTransaction(props.row.id, 'reviewed', $event)" /> -->
          <!-- </q-td> -->
          <!-- <q-td key="receipt" :props="props"> -->
            <!-- <a :href="props.row.receipt">Receipt</a> -->
            <!-- {{getReceipt('the-speaker-grill-small')}} -->
            <!-- <q-inner-loading :showing="!props.row.receiptURL"> -->
            <!-- </q-inner-loading> -->
            <!-- {{props.row.receiptURL.startsWith('https://')}} -->
          <!-- </q-td> -->
          <q-td key="actions" :props="props" auto-width>
            <q-btn
              :value="props.row.deleteRequested ? props.row.deleteRequested : false"
              @click="updateTransaction(props.row.id, 'deleteRequested', !props.row.deleteRequested)"
              :icon="props.row.deleteRequested ? 'unarchive' : 'archive'"
              dense
              class="q-mr-sm"
            >
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                {{!props.row.deleteRequested ? 'Request Delete' : 'Delete Requested'}}
              </q-tooltip>
            </q-btn>
            <sp-receipt :id="props.row.id" :label="props.row.id" :url="props.row.receiptURL" v-if="props.row.receiptURL > '' ? props.row.receiptURL.startsWith('https://') : false" class="q-mr-sm"/>
            <q-icon name="img:../statics/icons/no-receipt.png" style="height:30px;width:30px;padding:3.99px" v-if="props.row.receiptURL > '' ? !props.row.receiptURL.startsWith('https://') : true" class="q-mr-sm" />
            <q-spinner-gears size="30px" color="primary" v-if="!props.row.receiptURL && props.row.receipt">
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                Checking for receipt
              </q-tooltip>
            </q-spinner-gears>
          </q-td>
        </q-tr>
        <q-tr :props="props" class="text-bold" :class="{ 'bg-red-2': props.row.deleted, 'bg-green-2': !props.row.deleted}" v-if="props.row.reviewed">
          <q-td key="selected" :props="props">
            <!-- {{props.selected}} -->
            <q-checkbox v-model="props.selected" dense/>
          </q-td>
          <q-td key="number" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="icon" :props="props" >
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
          </q-td>
          <q-td key="category" :props="props">
            <!-- {{props.row.category}} -->
            <!-- {{budgets[props.row.category].category}} -->
            <!-- {{ props.row.id }} -->
            <div v-if="props.row.category !== 'Journal'">
              {{ props.row.category !== 'Journal' ? getCategoryById(props.row.budget) : '' }}
            </div>
          </q-td>
          <q-td key="budget" :props="props" >
            <!-- {{ props.row.text }} -->
            <div v-if="props.row.category === 'Expense'">
              {{ budgets[props.row.budget] ? budgets[props.row.budget].label : accounts[props.row.budget] ? accounts[props.row.budget].label : '' }}
            </div>
            <div v-if="props.row.category === 'Income'">
              <!-- {{ props.row.budget }} -->
              {{ budgets[props.row.budget] ? budgets[props.row.budget].label : accounts[props.row.budget] ? accounts[props.row.budget].label : '' }}
            </div>
            <div v-if="props.row.category === 'Journal'" >
              {{ accounts[props.row.from] ? accounts[props.row.from].label : '' }}
              {{ budgetCategories[props.row.from] ? budgetCategories[props.row.from].label : '' }}
              {{ budgets[props.row.from] ? budgets[props.row.from].label : '' }}
              <q-icon name="arrow_forward" v-if="props.row.category === 'Journal'" />
              {{ accounts[props.row.to] ? accounts[props.row.to].label : '' }}
              {{ budgetCategories[props.row.to] ? budgetCategories[props.row.to].label : '' }}
              {{ budgets[props.row.to] ? budgets[props.row.to].label : '' }}
            </div>
          </q-td>
          <q-td key="date" :props="props" >
            {{ props.row.date }}
          </q-td>
          <q-td key="amount" :props="props" :class="{ 'text-red-8': props.row.category === 'Expense', 'text-green-8': props.row.category === 'Income','text-blue-8': props.row.category === 'Journal', }"  >
            {{ parseFloat(props.row.amount).toFixed(2) }}
          </q-td>
          <q-td key="GST" :props="props">
            <!-- {{ getGST(props.row.text) }} -->
            {{ parseFloat(props.row.GST ? props.row.GST : 0).toFixed(2) }}
          </q-td>
          <q-td key="desc" :props="props"  style="white-space: normal;min-width:300px">
            {{ props.row.desc }}
          </q-td>
          <q-td key="cheque" :props="props">
            {{ props.row.cheque }}
          </q-td>
          <q-td key="actions" :props="props" auto-width>
            <q-spinner-gears size="30px" color="primary" v-if="!props.row.receiptURL && props.row.receipt">
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                Checking for receipt
              </q-tooltip>
            </q-spinner-gears>
            <sp-receipt :id="props.row.id" :label="props.row.id" :url="props.row.receiptURL" v-if="props.row.receiptURL > '' ? props.row.receiptURL.startsWith('https://') : false" class="q-mr-sm"/>
            <q-icon name="img:../statics/icons/no-receipt.png" style="height:30px;width:30px;padding:3.99px" v-if="props.row.receiptURL > '' ? !props.row.receiptURL.startsWith('https://') : true" class="q-mr-sm"/>
<!--             <q-btn
              :value="props.row.deleteRequested ? props.row.deleteRequested : false"
              @click="updateTransaction(props.row.id, 'deleteRequested', !props.row.deleteRequested)"
              icon="archive"
              dense
              class="q-mr-sm"
            >
              <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
                Request Delete
              </q-tooltip>
            </q-btn> -->
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary" :to="{ 'name': 'addTrans' }">
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Transaction
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-page-sticky position="bottom-right" :offset="[18, 18]" style="z-index:100" v-if="rowSelected.length > 0">
      <q-card class="bg-primary text-white">
        <q-card-section>
          Amount ({{project.currency}}): ${{calcSelected}}
          <q-tooltip content-class="bg-accent text-grey-10">
          Sum of {{rowSelected.length}} Selected
        </q-tooltip>
        </q-card-section>
      </q-card>
    </q-page-sticky>
    <div style="min-height:60px" />
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
        { name: 'selected', label: '', field: 'selected', align: 'left', sortable: true },
        { name: 'number', label: 'Transaction ID', field: 'number', align: 'center', sortable: true },
        { name: 'icon', label: 'Type', field: 'icon', align: 'center' },
        { name: 'category', label: 'Category', field: 'category', align: 'left', sortable: true },
        { name: 'budget', label: 'Account', field: 'budget', align: 'left', sortable: true },
        { name: 'date', label: 'Date', field: 'date', align: 'center', sortable: true },
        { name: 'amount', label: `Amount (currency)`, field: 'amount', align: 'center', sortable: true },
        { name: 'GST', label: `GST (currency)`, field: 'GST', align: 'center', sortable: true },
        { name: 'desc', label: 'Description', field: 'desc', align: 'center', sortable: true },
        { name: 'cheque', label: 'Cheque #', field: 'cheque', align: 'center', sortable: true },
        // { name: 'reviewed', label: 'Reviewed', field: 'reviewed', align: 'center', sortable: true },
        // { name: 'receipt', label: 'Receipt', field: 'receipt', align: 'center' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
      ],
      filter: '',
      ccOptions: [],
      visibleColumns: ['selected', 'icon', 'date', 'amount', 'GST', 'budget', 'desc', 'actions'],
      pagination: {
        sortBy: 'date',
        descending: true,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      rowSelected: [],
      showArchived: false,
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']
    }
  },
  created () {
    // console.log(this.project.currency)
    this.$store.dispatch('fetchMyTransactions', { projectId: this.$route.params.id, uid: this.user.uid })
    if (this.project.currency) {
      for (var key in this.columns) {
        if (this.columns[key].label.search('(currency)') !== -1) {
          this.columns[key].label = this.columns[key].label.replace('(currency)', `(${this.project.currency})`)
        }
      }
    }

    this.updateTransaction = debounce(this.updateTransaction, 1000)
    this.pagination.rowsPerPage = this.$q.localStorage.getItem('transTableRows')
  },
  methods: {
    ...mapActions([
      'updateMyTransactionByKey'
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
      // if (text > '') {
      //   // let totalFound = false
      //   // let amountFound
      //   let textArray = text.split('\n').join(' ').split(' ')
      //   // console.log(textArray.length)
      //   for (var key in textArray) {
      //     // console.log(key, textArray[key].toLowerCase())
      //     // if ((textArray[key].toLowerCase().indexOf('gst') !== -1) || (textArray[key].toLowerCase().indexOf('tax') !== -1)) {
      //     //   // console.log(key + 1)
      //     //   totalFound = true
      //     //   // console.log(textArray[key] + textArray[(parseInt(key) + 1)] + textArray[(parseInt(key) + 2)])
      //     // }
      //     // if ((totalFound || !totalFound) && textArray[key].indexOf('$') !== -1) {
      //       // console.log(key, textArray[key].toLowerCase())
      //       // return parseFloat(textArray[key].split('$').join(''))
      //     // }
      //   }
      // }
    },
    updateTransaction (trans, key, val) {
      // console.log(trans, key, val)
      // console.log(parseFloat(this.myTransactions[this.myTransactions.findIndex(x => x.id === trans)].amount) * 0.1, parseFloat(val), (parseFloat(val) <= (parseFloat(this.myTransactions[this.myTransactions.findIndex(x => x.id === trans)].amount) * 0.1)))
      if (key === 'GST' && (parseFloat(val) > (parseFloat(this.myTransactions[this.myTransactions.findIndex(x => x.id === trans)].amount) * 0.1))) {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'GST must be <= Amount'
        })
        return
      }
      this.updateMyTransactionByKey({ trans, key, val })
      firebase.firestore().collection(`/projects/${this.project.id}/transactions`).doc(trans)
        .update({ [key]: val })
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Transaction: Updated Successfully'
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
    },
    filterMethod (rows, terms, cols, cellValue) {
      const lowerTerms = terms ? terms.toLowerCase() : ''
      let res = rows.filter(
        row => cols.some(col => (typeof cellValue(col, row) === 'object') ? (Object.values(cellValue(col, row)) + '').toLowerCase().indexOf(lowerTerms) > -1 : (cellValue(col, row) + '').toLowerCase().indexOf(lowerTerms) !== -1)
      )
      return res
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'idToken',
      'myTransactions',
      'accounts',
      'budgets',
      'budgetOptions',
      'budgetCategories',
      'user'
    ]),
    columnsFiltered () {
      let columns = []
      for (var key in this.columns) {
        if (this.columns[key].name !== 'selected') columns.push(this.columns[key])
      }
      return columns
    },
    myTransactionsFiltered () {
      let myTransactions = []
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
        } else if (this.accounts[this.$route.params.budgetCategory]) {
          // the filter is an account
          // find all myTransactions in the account
          for (var transKey in this.myTransactions) {
            // check if the transaction exists in the budgets array
            console.log(!this.myTransactions[transKey].deleted || (this.myTransactions[transKey].deleted && this.showArchived))
            if (!this.myTransactions[transKey].deleted || (this.myTransactions[transKey].deleted && this.showArchived)) {
              // check it's not archieved and if it is archieve check if the archive is showing
              console.log(this.myTransactions[transKey], (this.$route.params.budgetCategory === this.myTransactions[transKey].budget), (this.$route.params.budgetCategory === this.myTransactions[transKey].to), (this.$route.params.budgetCategory === this.myTransactions[transKey].from))
              if (((this.$route.params.budgetCategory === this.myTransactions[transKey].budget) && (this.myTransactions[transKey].category !== 'Journal')) ||
                ((this.$route.params.budgetCategory === this.myTransactions[transKey].to) && (this.myTransactions[transKey].category === 'Journal')) ||
                ((this.$route.params.budgetCategory === this.myTransactions[transKey].from) && (this.myTransactions[transKey].category === 'Journal'))) {
                // add the myTransactions to the transaction array
                myTransactions.push(this.myTransactions[transKey])
              }
            }
          }
          return myTransactions
        } else {
          // the filter is not a category
          // add the budget to the array of budgets
          budgets = [this.$route.params.budgetCategory]
        }

        // find all myTransactions in the budgets
        for (transKey in this.myTransactions) {
          // check if the transaction exists in the budgets array
          // if (budgets.includes(this.myTransactions[transKey].budget)) {
          //   // check it's not archieved and if it is archieve check if the archive is showing
          //   if (!this.myTransactions[transKey].deleted || (this.myTransactions[transKey].deleted && this.showArchived)) {
          //     // add the myTransactions to the transaction array
          //     myTransactions.push(this.myTransactions[transKey])
          //   }
          // }
          // console.log(!this.myTransactions[transKey].deleted || (this.myTransactions[transKey].deleted && this.showArchived))
          if (!this.myTransactions[transKey].deleted || (this.myTransactions[transKey].deleted && this.showArchived)) {
            // check it's not archieved and if it is archieve check if the archive is showing
            // console.log(this.myTransactions[transKey], (this.$route.params.budgetCategory === this.myTransactions[transKey].budget), (this.$route.params.budgetCategory === this.myTransactions[transKey].to), (this.$route.params.budgetCategory === this.myTransactions[transKey].from))
            if ((budgets.includes(this.myTransactions[transKey].budget) && (this.myTransactions[transKey].category !== 'Journal')) ||
              (budgets.includes(this.myTransactions[transKey].to) && (this.myTransactions[transKey].category === 'Journal')) ||
              (budgets.includes(this.myTransactions[transKey].from) && (this.myTransactions[transKey].category === 'Journal'))) {
              // add the myTransactions to the transaction array
              myTransactions.push(this.myTransactions[transKey])
            }
          }
        }
      } else {
        // find all myTransactions in the budgets
        for (transKey in this.myTransactions) {
          // check it's not archieved and if it is archieve check if the archive is showing
          // console.log(this.myTransactions[transKey].id, !this.myTransactions[transKey].deleted, , this.showArchived)
          if (!this.myTransactions[transKey].deleted || (this.myTransactions[transKey].deleted && this.showArchived)) {
            // add the myTransactions to the transaction array
            myTransactions.push(this.myTransactions[transKey])
          }
        }
      }
      return myTransactions
    },
    calcSelected () {
      let total = 0
      for (var key in this.rowSelected) {
        // console.log(parseFloat(this.rowSelected[key].amount))
        total += parseFloat(this.rowSelected[key].amount)
      }
      return total.toFixed(2)
    },
    pageLabel () {
      let category = this.$route.params.budgetCategory
      return category > '' ? this.budgets[category] ? this.budgets[category].label : this.budgetCategories[category] ? this.budgetCategories[category].label : this.accounts[category] ? this.accounts[category].label : '' : ''
    }
  },
  watch: {
    project (oldVal, newVal) {
      // console.log(this.project.currency)
      for (var key in this.columns) {
        if (this.columns[key].label.search('(currency)') !== -1) {
          this.columns[key].label = this.columns[key].label.replace('(currency)', `(${this.project.currency})`)
        }
      }
    },
    user () {
      this.$store.dispatch('fetchMyTransactions', { projectId: this.$route.params.id, uid: this.user.uid })
    }
  },
  components: {
    // 'sp-trans-form': () => import('../components/sp-trans-form.vue'),
    'sp-receipt': () => import('../components/sp-receipt.vue')
    // 'sp-delete-btn': () => import('../components/sp-delete-btn.vue')
  }
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
