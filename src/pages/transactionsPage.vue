<template>
  <q-page padding>
<!--     <q-uploader
      :metadata="{customMetadata: {projectId: project.id, type: 'receipt'}}"
      color="teal"
      flat
      bordered
      style="max-width: 300px"
      auto-upload
    /> -->
    <q-table
      :data="transactionsFiltered"
      :columns="columns"
      :rows-per-page-options="[5,10,15,20]"
      row-key="name"
      :visible-columns="visibleColumns"
      :filter="filter"
      rows-per-page-label="Transactions per page:"
      :pagination.sync="pagination"
    >
      <template v-slot:top="props">
        <div class="col-2 q-table__title"> Transactions</div>

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
            {{ getCategoryById(props.row.category) }}
            <q-popup-edit v-model="props.row.category">
              <q-select v-model="props.row.category" dense autofocus label="Category" :options="budgets" option-label="category" option-value="category" />
            </q-popup-edit>
          </q-td>
          <q-td key="desc" :props="props">
            <!-- {{ props.row.text }} -->
            {{ budgets[props.row.category] ? budgets[props.row.category].label : '' }}
            <!-- <q-popup-edit v-model="props.row.desc">
              <q-input v-model="props.row.desc" dense autofocus label="Description" />
            </q-popup-edit> -->
          </q-td>
          <q-td key="number" :props="props">
            <!-- {{props.row.type}} -->

            {{ props.row.id }}
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
          <q-td key="amountAUD" :props="props">
            <!-- {{ getAmount(props.row.text) }} -->
            {{ props.row.amountAUD }}
            <q-popup-edit v-model="props.row.amountAUD">
              <q-input v-model="props.row.amountAUD" dense autofocus label="Amount (AUD)" />
            </q-popup-edit>
          </q-td>
          <q-td key="GST" :props="props">
            <!-- {{ getGST(props.row.text) }} -->
            {{ props.row.GST }}
            <q-popup-edit v-model="props.row.GST">
              <q-input v-model="props.row.GST" dense autofocus label="GST" />
            </q-popup-edit>
          </q-td>
          <q-td key="international" :props="props">
            <q-checkbox :value="props.row.currency !== 'AUD'" disabled/>
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
          <!-- <q-td key="type" :props="props">
            {{ props.row.type }}
            <q-popup-edit v-model="props.row.type">
              <q-select v-model="props.row.type" :options="typeOptions" dense autofocu label="Type" />
            </q-popup-edit>
          </q-td> -->
          <q-td key="cheque" :props="props">
            {{ props.row.cheque }}
            <q-popup-edit v-model="props.row.cheque">
              <q-input v-model="props.row.cheque" dense autofocus label="Cheque #" />
            </q-popup-edit>
          </q-td>
          <q-td key="deleted" :props="props">
            <q-checkbox v-model="props.row.deleted"/>
          </q-td>
          <q-td key="receipt" :props="props">
            <!-- <a :href="props.row.receipt">Receipt</a> -->
            <!-- {{getReceipt('the-speaker-grill-small')}} -->
            <sp-receipt :id="props.row.id" :label="props.row.number" :url="props.row.receiptURL" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary">
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Transation
        </q-tooltip>
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item>
              <q-item-section>
                Add Transaction
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <!-- <q-date v-model="newTrans.date" dense  /> -->
                <q-input v-model="newTrans.date" mask="date" label="Date" :rules="['date']" dense>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                        <q-date v-model="newTrans.date" @input="() => $refs.qDateProxy.hide()" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-select v-model="newTrans.category" dense label="Category" :options="budgetOptions" option-label="label" :option-value="(item) => item === null ? null : item.id" />
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-select v-model="newTrans.type" dense label="Type" :options="typeOptions" />
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-input v-model="newTrans.amountAUD" dense label="Amount (AUD)" />
                <!-- </q-popup-edit> -->
              </q-item-section>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-input v-model="newTrans.GST" dense label="GST (AUD)" />
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-firebase-uploader
                  :metadata="{customMetadata: {projectId: project.id, type: newTrans.type, category: newTrans.category.id, amountAUD: newTrans.amountAUD, GST: newTrans.GST, date: newTrans.date}}"
                  color="teal"
                  flat
                  bordered
                  style="max-width: 300px"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
// import firebase from 'firebase/app'
// require('firebase/auth')
// require('firebase/firestore')

import { mapGetters } from 'vuex'

const columns = [
  { name: 'icon', label: 'Type', field: 'icon', align: 'center' },
  { name: 'category', label: 'Budget Category', field: 'category', align: 'center', sortable: true },
  { name: 'desc', label: 'Description', field: 'desc', align: 'center', sortable: true },
  { name: 'number', label: 'Transaction ID', field: 'number', align: 'center', sortable: true },
  { name: 'date', label: 'Date', field: 'date', align: 'center', sortable: true },
  { name: 'amountAUD', label: 'Amount (AUD)', field: 'amountAUD', align: 'center', sortable: true },
  { name: 'GST', label: 'GST (AUD)', field: 'GST', align: 'center', sortable: true },
  { name: 'international', label: 'International?', field: 'international', align: 'center', sortable: true },
  { name: 'currency', label: 'Currency', field: 'currency', align: 'center', sortable: true },
  { name: 'amountInt', label: 'Amount (Int)', field: 'amountInt', align: 'center', sortable: true },
  // { name: 'type', label: 'Type', field: 'type', align: 'center', sortable: true },
  { name: 'cheque', label: 'Cheque #', field: 'cheque', align: 'center', sortable: true },
  { name: 'deleted', label: 'Deleted', field: 'deleted', align: 'center', sortable: true },
  { name: 'receipt', label: '', field: 'receipt', align: 'center' }
]

var cc = require('currency-codes')

export default {
  data () {
    return {
      columns,
      filter: '',
      ccOptions: [],
      visibleColumns: ['icon', 'date', 'amountAUD', 'GST', 'type', 'category', 'desc', 'receipt'],
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card'],
      pagination: {
        sortBy: 'date',
        descending: true,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      newTrans: {
        category: '',
        type: 'Cash',
        date: '',
        amountAUD: '',
        GST: ''
      }
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
    },
    getCategoryById (id) {
      if (this.budgets[id]) {
        return this.budgetCategories[this.budgets[id].category].category
      } else if (this.budgetCategories[id]) {
        return this.budgetCategories[id].category
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
    }
    // async getReceipt (id) {
    //   // return firebase.auth().onAuthStateChanged(async (user) => {
    //   // console.log(this.idToken)
    //   if (this.idToken > '' && id > '') {
    //     const src = `/receipt?projectId=${this.project.id}&id=${id}`
    //     const options = {
    //       headers: {
    //         Authorization: `Bearer ${this.idToken}`
    //       }
    //     }

    //     let res = await fetch(src, options)
    //     console.log(id, res)
    //     let url = await res.text()
    //     console.log(url)
    //     return url
    //   }
    //   // })
    // }
  },
  computed: {
    ...mapGetters([
      'project',
      'idToken',
      'transactions',
      'budgets',
      'budgetOptions',
      'budgetCategories'
    ]),
    transactionsFiltered () {
      // for (var key in this.transactions) {
      //   if (this.transactions[key].receiptURL <= '') {
      //     this.transactions[key].receiptURL
      //   }
      // }
      if (this.$route.params.budgetCategory) {
        let transactions = []
        // console.log(this.transactions)
        for (var key in this.transactions) {
          // console.log(this.$route.params.budgetCategory, '===', this.transactions[key].category)
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
    'q-firebase-uploader': () => import('../components/q-firebase-uploader-base.vue'),
    'sp-receipt': () => import('../components/sp-receipt.vue')
  }
}
</script>
