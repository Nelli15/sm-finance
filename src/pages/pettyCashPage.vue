<template>
  <q-page>
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
    </q-tab-panels>

<!--     <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary" >
        <q-tooltip content-class="bg-accent text-grey-10">
          Add to Petty Cash
        </q-tooltip>
        <sp-pettycash-form :projectId="$route.params.id" />
      </q-btn>
    </q-page-sticky> -->
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

export default {
  data () {
    return {
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
      'pettyTransactions',
      'budgetCategories',
      'budgets',
      'accounts'
    ]),
    expected () {
      return this.accounts['pettyCash'].income - this.accounts['pettyCash'].expenses
    },
    total () {
      return (this.dollars.hundreds * 100 + this.dollars.fifties * 50 + this.dollars.twenties * 20 + this.dollars.tens * 10 + this.dollars.fives * 5 + this.dollars.twos * 2 + this.dollars.ones * 1 + this.cents.fifties * 0.5 + this.cents.twenties * 0.2 + this.cents.tens * 0.1 + this.cents.fives * 0.05).toFixed(2)
    }
  },
  methods: {
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 31%
  margin-right: 0px
</style>
