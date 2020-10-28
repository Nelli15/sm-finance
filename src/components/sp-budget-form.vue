<template>
  <q-form @reset="onReset" @submit="onSubmit">
    <q-list style="min-width: 100px;min-height:360px;">
      <q-item>
        <q-btn-toggle
          v-model="newBudget.type"
          toggle-color="primary"
          :options="[
            { label: 'Budget', value: 'budget' },
            { label: 'Category', value: 'category' },
            { label: 'Account', value: 'account' },
            { label: 'Transaction', value: 'transaction' }
          ]"
          push
          dense
          class="q-mx-auto"
        />
      </q-item>
      <q-item
        class="text-h6 justify-center"
        v-if="newBudget.type !== 'transaction'"
      >
        Add
        {{ newBudget.type.charAt(0).toUpperCase() + newBudget.type.slice(1) }}

        <q-icon
          name="help_outline"
          style="cursor:pointer;"
          size="xs"
          color="grey-7"
        >
          <q-menu max-width="370px" anchor="center right" self="center left">
            <q-list
              separator
              class="q-px-sm"
              v-if="newBudget.type === 'budget'"
            >
              <q-item>
                <q-item-section>
                  <q-item-label header class="text-bold"
                    >Add Budget</q-item-label
                  >
                  <q-item-label caption>
                    This form is used to create a new Budget
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-expansion-item expand-separator label="Budget Label">
                <q-card>
                  <q-card-section>
                    The label/name for the new budget.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Category">
                <q-card>
                  <q-card-section>
                    The Budget Category this Budget is linked to. All Budgets
                    must be linked to a Budget Category.<br />
                    If this field is blank try creating a Category by clicking
                    the Category tab at the top of this form.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Budget Amount">
                <q-card>
                  <q-card-section>
                    The amount you have allocated to be spent in this Budget
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Create">
                <q-card>
                  <q-card-section>
                    Create the Budget
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Clear">
                <q-card>
                  <q-card-section>
                    Clear all fields of this form
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
            <q-list
              separator
              class="q-px-sm"
              v-else-if="newBudget.type === 'category'"
            >
              <q-item>
                <q-item-section>
                  <q-item-label header class="text-bold"
                    >Add Category</q-item-label
                  >
                  <q-item-label caption>
                    This form is used to create a new Budget Category
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-expansion-item expand-separator label="Budget Label">
                <q-card>
                  <q-card-section>
                    The label/name for the new Budget Category.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Create">
                <q-card>
                  <q-card-section>
                    Create the Budget Category
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Clear">
                <q-card>
                  <q-card-section>
                    Clear all fields of this form
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
            <q-list
              separator
              class="q-px-sm"
              v-else-if="newBudget.type === 'account'"
            >
              <q-item>
                <q-item-section>
                  <q-item-label header class="text-bold"
                    >Add Account</q-item-label
                  >
                  <q-item-label caption>
                    This form is used to create a new Account
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-expansion-item expand-separator label="Budget Label">
                <q-card>
                  <q-card-section>
                    The label/name for the new Account.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Create">
                <q-card>
                  <q-card-section>
                    Create the Account
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Clear">
                <q-card>
                  <q-card-section>
                    Clear all fields of this form
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-menu>
        </q-icon>
      </q-item>
      <q-item v-if="newBudget.type === 'transaction'">
        <sp-trans-form
          :projectId="project.id"
          @onSubmit="$emit('onSubmit', $event)"
        />
      </q-item>
      <q-item v-if="newBudget.type !== 'transaction'">
        <q-input
          v-model="newBudget.label"
          :label="
            newBudget.type.charAt(0).toUpperCase() +
              newBudget.type.slice(1) +
              ' Label'
          "
          stack-label
          style="width:100%"
        />
      </q-item>
      <q-item v-if="newBudget.type === 'budget'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="
            newBudget.category > ''
              ? budgets[newBudget.category]
                ? budgets[newBudget.category].label
                : budgetCategories[newBudget.category].label
              : ''
          "
          dense
          label="Category"
          stack-label
          :options="budgetCategoryOptions"
          option-label="label"
          :option-value="item => (item === null ? null : item.id)"
          @input="newBudget.category = $event.id"
          style="width:100%"
        />
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-if="newBudget.type === 'budget'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-input
          v-model="newBudget.budget"
          dense
          :label="'Budget Amount (' + project.currency + ')'"
          stack-label
          type="number"
          style="width:100%"
          :rules="[val => !!val || 'Field is Required!']"
          prefix="$"
        />
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item
        class="absolute-bottom q-mb-sm"
        v-if="newBudget.type !== 'transaction'"
      >
        <q-btn label="Create" type="submit" color="secondary" />
        <q-btn
          label="Clear"
          type="reset"
          color="secondary"
          flat
          class="q-ml-sm"
        />
      </q-item>
    </q-list>
  </q-form>
</template>

<script>
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/firestore')

export default {
  props: ['projectId', 'show'],
  data() {
    return {
      newBudget: {
        category: '', // ID
        type: 'budget', // ['budget', 'category', 'account']
        label: '', // name of budget or category
        budget: '' // the amount budgeted
      },
      loading: false
    }
  },
  created() {
    if (this.show) {
      this.newBudget.type = this.show
    }
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
    // this.$q.loading.show()
  },
  methods: {
    onSubmit(event) {
      // this.loading = true
      this.$q.loading.show()
      if (this.newBudget.type === 'budget' && this.newBudget.category <= '') {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'Budget Category must not be blank'
        })
        this.$q.loading.hide()
        return false
      }
      // console.log(`/projects/${this.projectId}/budgets`)
      if (this.newBudget.type === 'account') {
        this.newBudget.inHeader = false
      }
      let newBudgetRef = firebase
        .firestore()
        .collection(`/projects/${this.projectId}/accounts`)
        .doc()
      // console.log(newBudgetRef)
      newBudgetRef
        .set(this.newBudget)
        .then(res => {
          this.$q.loading.hide()
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `${this.newBudget.type}: ${this.newBudget.label} Created Successfully`
          })
          this.$emit('onSubmit', this.newBudget)
        })
        .catch(err => {
          console.error(err)
          this.$q.loading.hide()
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
      // this.loading = false
    },
    onReset(event) {
      this.newBudget = {
        category: '', // ID
        type: 'budget', // ['budget', 'category', 'account']
        label: '', // name of budget or category
        budget: '' // the amount budgeted
      }
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'budgets',
      'budgetCategories',
      'budgetOptions',
      'budgetCategoryOptions'
    ])
  },
  components: {
    'sp-trans-form': () => import('../components/sp-trans-form.vue')
  }
}
</script>
