<template>
  <q-page>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      style="width:100%"
    >
      <q-tab name="calculator" label="Calculator" />
      <q-tab name="transactions" label="Transactions" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated >
      <q-tab-panel name="calculator" class="row items-start q-gutter-md">
        <q-card class="my-card shadow-0">
          <q-card-section class="text-h6">
            Notes
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <q-input prefix="$100 x" :suffix="'$'+(dollars.hundreds * 100).toFixed(2)" color="secondary" outlined v-model="dollars.hundreds" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="$50 x" :suffix="'$'+(dollars.fifties * 50).toFixed(2)" color="secondary" outlined v-model="dollars.fifties" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="$20 x" :suffix="'$'+(dollars.twenties * 20).toFixed(2)" color="secondary" outlined v-model="dollars.twenties" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="$10 x" :suffix="'$'+(dollars.tens * 10).toFixed(2)" color="secondary" outlined v-model="dollars.tens" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="$5 x" :suffix="'$'+(dollars.fives * 5).toFixed(2)" color="secondary" outlined v-model="dollars.fives" type="number" style="max-width:250px" dense>
            </q-input>
          </q-card-section>
        </q-card>
        <q-card class="my-card shadow-0">
          <q-card-section class="text-h6">
            Coins
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <q-input prefix="$2 x" :suffix="'$'+(dollars.twos * 2).toFixed(2)" color="secondary" outlined v-model="dollars.twos" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="$1 x" :suffix="'$'+(dollars.ones * 1).toFixed(2)" color="secondary" outlined v-model="dollars.ones" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="50c x" :suffix="'$'+(cents.fifties * 0.50).toFixed(2)" color="secondary" outlined v-model="cents.fifties" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="20c x" :suffix="'$'+(cents.twenties * 0.20).toFixed(2)" color="secondary" outlined v-model="cents.twenties" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="10c x" :suffix="'$'+(cents.tens * 0.10).toFixed(2)" color="secondary" outlined v-model="cents.tens" type="number" style="max-width:250px" dense>
            </q-input>
            <q-input prefix="5c x" :suffix="'$'+(cents.fives * 0.05).toFixed(2)" color="secondary" outlined v-model="cents.fives" type="number" style="max-width:250px" dense>
            </q-input>
          </q-card-section>
        </q-card>
        <q-card class="my-card shadow-0">
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section class="text-h6">
                  Calculated
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section>
                  <q-input outlined prefix="Total:" :value="'$'+total" dense>
                  </q-input>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-input outlined prefix="Expected:" :value="'$'+expected" dense>
                  </q-input>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-input outlined prefix="Difference: " :value="'$'+(total - expected).toFixed(2)" dense disabled :rules="[val => Number(val.replace(/[^0-9.-]+/g,'')) > -0.05 || `Petty Cash is missing money`, val => Number(val.replace(/[^0-9.-]+/g,'')) < 0.05 || `Petty Cash has too much money`]">
                  </q-input>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <q-tab-panel name="transactions">
        <q-table
          :data="petty"
          :columns="columns"
          :rows-per-page-options="[5,10,15,20]"
          row-key="name"
          :visible-columns="visibleColumns"
          :filter="filter"
          rows-per-page-label="Transactions per page:"
          :pagination.sync="pagination"
        >
          <template v-slot:top="props">
            <div class="col-4 q-table__title">Petty Cash Transactions</div>

            <q-space />

            <q-select
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
              <q-td key="number" :props="props">
                {{ props.row.number }}
                <q-popup-edit v-model="props.row.number">
                  <q-input v-model="props.row.number" dense autofocus counter label="Transaction Number" />
                </q-popup-edit>
              </q-td>
              <q-td key="debits" :props="props">
                {{ props.row.category === 'debit' ? props.row.amountAUD : '' }}
                <q-popup-edit v-model="props.row.amountAUD">
                  <q-input v-model="props.row.amountAUD" dense autofocus label="Amount (AUD)" />
                </q-popup-edit>
              </q-td>
              <q-td key="credits" :props="props">
                {{ props.row.category === 'credit' ? props.row.amountAUD : '' }}
                <q-popup-edit v-model="props.row.amountAUD">
                  <q-input v-model="props.row.amountAUD" dense autofocus label="Amount (AUD)" />
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
            </q-tr>
          </template>
        </q-table>
      </q-tab-panel>

    </q-tab-panels>

    <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary" >
        <q-tooltip content-class="bg-accent text-grey-10">
          Add to Petty Cash
        </q-tooltip>
        <sp-pettycash-form :projectId="$route.params.id" />
      </q-btn>
    </q-page-sticky>
    <q-page-sticky position="bottom-right" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="help" color="primary" >
        <q-tooltip content-class="bg-accent text-grey-10">
          Help
        </q-tooltip>
        <q-menu>
          <q-card>
            <q-card-section>
              How to use the Petty Cash Calculator?
            </q-card-section>
            <q-card-section>
              <q-expansion-item
                expand-separator
                icon="add"
                label="Add money to Petty Cash"
              >
                <q-card>
                  <q-card-section>
                    Create a new transaction and set the category to 'Petty', make sure that the type is not 'Cash',the amount included will be added to the Petty Cash 'Expected' cell.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-card-section>
            <q-card-section>
              <q-expansion-item
                expand-separator
                icon="remove"
                label="Withdrawing money from Petty Cash"
              >
                <q-card>
                  <q-card-section>
                    Create a new transaction and set the category to 'Petty', the amount included will be added to the Petty Cash 'Expected' cell.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-card-section>
          </q-card>
        </q-menu>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

const columns = [
  { name: 'icon', label: 'Type', field: 'icon', align: 'center' },
  { name: 'date', label: 'Date', field: 'date', align: 'center', sortable: true },
  { name: 'number', label: 'Transaction Number', field: 'number', align: 'center', sortable: true },
  { name: 'debits', label: 'Debits', field: 'debits', align: 'center', sortable: true },
  { name: 'credits', label: 'Credits', field: 'credits', align: 'center', sortable: true },
  { name: 'desc', label: 'Description', field: 'desc', align: 'center', sortable: true },
  { name: 'deleted', label: 'Deleted', field: 'deleted', align: 'center', sortable: true }
]

var cc = require('currency-codes')

export default {
  data () {
    return {
      columns,
      filter: '',
      ccOptions: [],
      visibleColumns: ['icon', 'number', 'date', 'amountAUD', 'type', 'category', 'desc', 'debits', 'credits'],
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card'],
      pagination: {
        sortBy: 'date',
        descending: true,
        page: 1,
        rowsPerPage: 10
      },
      dollars: {
        hundreds: 0,
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
        twos: 0,
        ones: 0
      },
      cents: {
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0
      },
      tab: 'calculator'
    }
  },
  created () {
    this.$store.dispatch('fetchPetty', this.$route.params.id)
  },
  computed: {
    ...mapGetters([
      'petty',
      'budgetCategories',
      'budgets'
    ]),
    expected () {
      let credits = 0
      let debits = 0
      for (var transKey in this.petty) {
        let transaction = this.petty[transKey]
        if (transaction.category === 'credit') {
          credits += transaction.amountAUD
        } else if (transaction.category === 'debit') {
          debits += transaction.amountAUD
        }
      }
      return debits - credits
    },
    total () {
      return (this.dollars.hundreds * 100 + this.dollars.fifties * 50 + this.dollars.twenties * 20 + this.dollars.tens * 10 + this.dollars.fives * 5 + this.dollars.twos * 2 + this.dollars.ones * 1 + this.cents.fifties * 0.5 + this.cents.twenties * 0.2 + this.cents.tens * 0.1 + this.cents.fives * 0.05).toFixed(2)
    }
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
  components: {
    'sp-pettycash-form': () => import('./../components/sp-pettycash-form.vue')
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 31%
  margin-right: 0px
</style>
