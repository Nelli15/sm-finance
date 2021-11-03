<template>
  <q-page>
    <q-card>
      <q-card-section class="text-center text-h5"
        >Petty Cash Calculator
        <q-icon
          name="help_outline"
          style="cursor: pointer"
          size="xs"
          color="grey-7"
        >
          <q-menu max-width="370px" anchor="center right" self="center left">
            <q-list separator class="q-pa-sm q-gutter-xs">
              <q-item>
                <q-item-section>
                  <q-item-label header class="text-bold"
                    >Petty Cash Calculator</q-item-label
                  >
                  <q-item-label caption>
                    Calculates the amount of Petty Cash that you have and
                    compares it to the expected amount of Petty Cash. Enter the
                    number of each note and coin that you have in the fields
                    below to get started.
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-expansion-item
                expand-separator
                label="Correct"
                class="bg-positive text-white rounded-borders"
              >
                <q-card>
                  <q-card-section class="text-black">
                    If your Petty Cash is correct, the Difference field will go
                    green and the value will show as $0.00. When this happens,
                    you have done your job correctly, WELL DONE! Go enjoy your
                    day.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item
                expand-separator
                label="Money missing"
                class="bg-negative text-white rounded-borders"
              >
                <q-card>
                  <q-card-section class="text-black">
                    If the Difference field shows 'Petty Cash has more money
                    than expected', then you have done something wrong. You have
                    probably either given someone less cash than you were meant
                    to, you have been given too much money back, or you haven't
                    recorded a Transaction to or from the Petty Cash Account
                    properly. Double check your work. If everything seems
                    correct, and the amount is small, don't worry too much this
                    is not a huge problem. If it is a small amount, it could be
                    a rounding error. Ensure that the Amount fields of each
                    Transaction is showing a multiple of 5 cents.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item
                expand-separator
                label="Money is missing from Petty Cash"
                class="bg-negative text-white rounded-borders"
              >
                <q-card>
                  <q-card-section class="text-black">
                    If the Difference field shows '(Money is missing from Petty
                    Cash)', then you have done something wrong. You have
                    probably either given someone more cash than you were meant
                    to, you have been given less money back, or you haven't
                    recorded a Transaction to or from the Petty Cash Account
                    properly. Double check your work. If everything seems
                    correct, and the amount is small, don't worry too much this
                    is not a huge problem. If it is a small amount, it could be
                    a rounding error. Ensure that the Amount fields of each
                    Transaction is showing a multiple of 5 cents.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item
                expand-separator
                label="Petty Cash can't be negative"
                class="bg-negative text-white rounded-borders"
              >
                <q-card>
                  <q-card-section class="text-black">
                    If the Expected field shows 'Petty Cash can't be negative',
                    then you have done something wrong. You have probably
                    either, recorded too many Transactions removing money from
                    the Petty Cash Account, or forgotten to record a Transaction
                    when you added money to the Petty Cash tin. Double check
                    your work. If it is a small amount, it could be a rounding
                    error. Ensure that the Amount fields of each Transaction is
                    showing a multiple of 5 cents.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-menu>
        </q-icon>
      </q-card-section>
    </q-card>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="calculator" class="row items-start q-gutter-md">
        <q-card class="my-card shadow-0">
          <q-card-section class="text-h6"> Notes </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <q-input
              prefix="$100 x"
              :suffix="'$' + (dollars['hundreds'] * 100).toFixed(2)"
              color="secondary"
              outlined
              :model-value="dollars['hundreds']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="
                updatePetty('petty.dollars.hundreds', $event)
              "
            >
            </q-input>

            <q-input
              prefix="$50 x"
              :suffix="'$' + (dollars['fifties'] * 50).toFixed(2)"
              color="secondary"
              outlined
              :model-value="dollars['fifties']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.dollars.fifties', $event)"
            >
            </q-input>
            <q-input
              prefix="$20 x"
              :suffix="'$' + (dollars['twenties'] * 20).toFixed(2)"
              color="secondary"
              outlined
              :model-value="dollars['twenties']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="
                updatePetty('petty.dollars.twenties', $event)
              "
            >
            </q-input>
            <q-input
              prefix="$10 x"
              :suffix="'$' + (dollars['tens'] * 10).toFixed(2)"
              color="secondary"
              outlined
              :model-value="dollars['tens']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.dollars.tens', $event)"
            >
            </q-input>
            <q-input
              prefix="$5 x"
              :suffix="'$' + (dollars['fives'] * 5).toFixed(2)"
              color="secondary"
              outlined
              :model-value="dollars['fives']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.dollars.fives', $event)"
            >
            </q-input>
          </q-card-section>
        </q-card>
        <q-card class="my-card shadow-0">
          <q-card-section class="text-h6"> Coins </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <q-input
              prefix="$2 x"
              :suffix="'$' + (dollars['twos'] * 2).toFixed(2)"
              color="secondary"
              outlined
              :model-value="dollars['twos']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.dollars.twos', $event)"
            >
            </q-input>
            <q-input
              prefix="$1 x"
              :suffix="'$' + (dollars['ones'] * 1).toFixed(2)"
              color="secondary"
              outlined
              :model-value="dollars['ones']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.dollars.ones', $event)"
            >
            </q-input>
            <q-input
              prefix="50c x"
              :suffix="'$' + (cents['fifties'] * 0.5).toFixed(2)"
              color="secondary"
              outlined
              :model-value="cents['fifties']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.cents.fifties', $event)"
            >
            </q-input>
            <q-input
              prefix="20c x"
              :suffix="'$' + (cents['twenties'] * 0.2).toFixed(2)"
              color="secondary"
              outlined
              :model-value="cents['twenties']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.cents.twenties', $event)"
            >
            </q-input>
            <q-input
              prefix="10c x"
              :suffix="'$' + (cents['tens'] * 0.1).toFixed(2)"
              color="secondary"
              outlined
              :model-value="cents['tens']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.cents.tens', $event)"
            >
            </q-input>
            <q-input
              prefix="5c x"
              :suffix="'$' + (cents['fives'] * 0.05).toFixed(2)"
              color="secondary"
              outlined
              :model-value="cents['fives']"
              type="number"
              style="max-width: 250px"
              dense
              @update:model-value="updatePetty('petty.cents.fives', $event)"
            >
            </q-input>
          </q-card-section>
        </q-card>
        <q-card class="my-card shadow-0">
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section class="text-h6"> Calculated </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section class="text-bold q-pl-sm">
                  Total in Petty Cash: ${{ parseFloat(total).toFixed(2) }}
                  <!-- <q-input outlined prefix="Total:" :model-value="'$' + total" dense> -->
                  <!-- </q-input> -->
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section
                  avatar
                  class="
                    text-bold
                    q-pl-md
                    rounded-borders
                    bg-negative
                    text-white
                  "
                  v-if="
                    Number(expected.toFixed(2).replace(/[^0-9.-]+/g, '')) <=
                    -0.05
                  "
                >
                  <q-icon name="warning" />
                </q-item-section>
                <q-item-section
                  class="text-bold q-pl-sm rounded-borders"
                  :class="{
                    'bg-negative text-white':
                      Number(expected.toFixed(2).replace(/[^0-9.-]+/g, '')) <=
                      -0.05,
                  }"
                >
                  Expected: ${{ expected.toFixed(2) }}<br />
                  {{
                    Number(expected.toFixed(2).replace(/[^0-9.-]+/g, '')) <=
                    -0.05
                      ? "(Petty Cash can't be negative)"
                      : ''
                  }}
                  <!-- <q-input
                    outlined
                    prefix="Expected:"
                    :model-value="'$' + expected.toFixed(2)"
                    dense
                  >
                  </q-input> -->
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section
                  avatar
                  class="
                    text-bold
                    q-pl-md
                    rounded-borders
                    bg-negative
                    text-white
                  "
                  v-if="
                    Number(
                      (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                    ) <= -0.05 ||
                    Number(
                      (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                    ) >= 0.05
                  "
                >
                  <q-icon name="warning" />
                </q-item-section>
                <q-item-section
                  class="text-bold q-pl-sm rounded-borders"
                  :class="{
                    'bg-positive':
                      Number(
                        (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                      ) > -0.05 &&
                      Number(
                        (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                      ) < 0.05,
                    'bg-negative text-white':
                      Number(
                        (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                      ) <= -0.05 ||
                      Number(
                        (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                      ) >= 0.05,
                  }"
                >
                  Difference: ${{ (total - expected).toFixed(2) }}<br />
                  {{
                    Number(
                      (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                    ) <= -0.05
                      ? '(Money is missing from Petty Cash)'
                      : ''
                  }}{{
                    Number(
                      (total - expected).toFixed(2).replace(/[^0-9.-]+/g, '')
                    ) >= 0.05
                      ? '(Petty Cash has more money than expected)'
                      : ''
                  }}
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
    <!-- <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      style="z-index:100"
    >
      <q-btn fab icon="help" color="primary">
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
                    Create a new transaction and set the category to 'Petty',
                    make sure that the type is not 'Cash',the amount included
                    will be added to the Petty Cash 'Expected' cell.
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
                    Create a new transaction and set the category to 'Petty',
                    the amount included will be added to the Petty Cash
                    'Expected' cell.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-card-section>
          </q-card>
        </q-menu>
      </q-btn>
    </q-page-sticky> -->
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { debounce } from 'quasar'
import { updatePettyByKey } from './../scripts/project.js'

export default {
  data() {
    return {
      // dollars: {
      //   hundreds: 0,
      //   fifties: 0,
      //   twenties: 0,
      //   tens: 0,
      //   fives: 0,
      //   twos: 0,
      //   ones: 0
      // },
      // cents: {
      //   fifties: 0,
      //   twenties: 0,
      //   tens: 0,
      //   fives: 0
      // },
      tab: 'calculator',
    }
  },
  created() {
    // this.$store.dispatch('fetchPetty', this.$route.params.id)
    this.updatePetty = debounce(this.updatePetty, 500)
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('budgets', ['accounts', 'budgets', 'budgetCategories']),
    ...mapGetters('petty', ['dollars', 'cents']),
    expected() {
      return this.accounts['pettyCash']
        ? this.accounts['pettyCash'].balance
          ? this.accounts['pettyCash'].balance
          : 0
        : 0
    },
    total() {
      return (
        this.dollars['hundreds'] * 100 +
        this.dollars['fifties'] * 50 +
        this.dollars['twenties'] * 20 +
        this.dollars['tens'] * 10 +
        this.dollars['fives'] * 5 +
        this.dollars['twos'] * 2 +
        this.dollars['ones'] * 1 +
        this.cents['fifties'] * 0.5 +
        this.cents['twenties'] * 0.2 +
        this.cents['tens'] * 0.1 +
        this.cents['fives'] * 0.05
      ).toFixed(2)
    },
  },
  methods: {
    ...mapActions('petty', ['updatePettyByKey']),
    updatePetty(key, val) {
      console.log(key, val)
      if (val < 0) return
      // console.log('updatePetty', `/projects/`, this.project.id)
      this.updatePettyByKey({ key, val })
      updatePettyByKey(this.$route.params.id, key, val)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Petty Cash: Updated Successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    },
  },
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 31%
  margin-right: 0px
</style>
