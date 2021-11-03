<template>
  <div>
    <q-item class="justify-center">
      Budgets are used to track the flow and location of all finances on a
      Project. Contact your Project Leader for a detailed Project Budget
      Breakdown. If they don’t have a budget breakdown we suggest making one
      with them. Everything that you spend money on Project will need to be
      recorded as a transaction within its relevant budget. Import a CSV to
      create multiple Budgets at once, or add them manually below.
    </q-item>

    <q-item v-if="Object.keys(budgets).length > 0">
      <q-item-section>
        <q-item-label class="text-h6"> Current Budgets </q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="Object.keys(budgets).length > 0">
      <q-item-section avatar>Budget</q-item-section>
      <q-item-section>Label</q-item-section>
      <q-item-section side>Actions</q-item-section>
    </q-item>
    <q-scroll-area
      :style="`height: ${
        56 * Object.keys(budgets).length
      }px; max-height: 50vh;`"
    >
      <q-list>
        <q-item
          v-for="account in Object.values(budgets).sort((a, b) =>
            a.label > b.label ? 1 : -1
          )"
          :key="account.id"
        >
          <q-item-section avatar>
            <q-badge
              :class="{
                'bg-green-8': (account.budget ? account.budget : 0) > 0,
                'bg-red-8': (account.budget ? account.budget : 0) < 0,
                'bg-black': (account.budget ? account.budget : 0) == 0,
              }"
              :label="'$' + (account.budget ? account.budget : 0).toFixed(2)"
            />
          </q-item-section>
          <q-item-section key="label" class="cursor-pointer text-bold">
            {{ account.label }}
            <q-popup-edit v-model="account.label">
              <q-input
                :value="account.label > '' ? account.label : ''"
                @update:model-value="updateBudget(account.id, 'label', $event)"
                dense
                autofocus
                label="Budget Label"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
            >
              <q-icon name="edit" />Edit
            </q-tooltip>
            <q-badge
              v-if="account.transAwaitingReview > 0"
              class="bg-red-8"
              :label="
                account.transAwaitingReview ? account.transAwaitingReview : ''
              "
              floating
            />
          </q-item-section>

          <!-- <q-item-section key="awaitingReviews" >
            {{
              account.transAwaitingReview ? account.transAwaitingReview : ''
            }}
          </q-item-section> -->
          <span class="q-ml-auto">
            <q-btn :to="'transactions/' + account.id" dense class="q-mr-sm"
              >Transactions</q-btn
            >
            <q-btn v-if="account.inUse" dense color="negative">
              <q-icon name="delete_forever" />
              <q-tooltip content-class="bg-accent text-black"
                >Cannot Delete Budget while in use</q-tooltip
              >
            </q-btn>
            <sp-delete-btn
              dense
              v-if="!account.inUse"
              :docRef="`/projects/${project.id}/accounts/${account.id}`"
            />
          </span>
        </q-item>
      </q-list>
    </q-scroll-area>
    <div v-if="add">
      <q-item>
        <q-input
          label="Budget Label"
          stack-label
          v-model="newBudget.label"
          style="width: 100%"
        />
      </q-item>
      <q-item>
        <q-select
          :model-value="
            newBudget.category > ''
              ? budgets[newBudget.category]
                ? budgets[newBudget.category].label
                : budgetCategories[newBudget.category].label
              : ''
          "
          dense
          label="Category"
          stack-label
          :options="budgetCategoryOptionsFiltered"
          option-label="label"
          :option-value="(item) => (item === null ? null : item.id)"
          @update:model-value="newBudget.category = $event.id"
          style="width: 100%"
          use-input
          @filter="budgetCategoriesFilterFn"
          input-debounce="0"
        />
      </q-item>
      <q-item>
        <q-input
          v-model="newBudget.budget"
          dense
          :label="'Budget Amount (' + project.currency + ')'"
          stack-label
          type="number"
          style="width: 100%"
          :rules="[(val) => !!val || 'Field is Required!']"
          prefix="$"
        />
      </q-item>
      <q-item>
        <q-btn
          @click="createAccount"
          icon="send"
          label="Create"
          dense
          color="positive"
          class="full-width"
        />
      </q-item>
    </div>
    <div class="or" v-if="add">OR</div>
    <div v-if="add" class="full-width">
      <div><sp-budget-import /></div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { createAccount } from '../../../scripts/accounts.js'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'createBudget',
  data() {
    return {
      newBudget: {
        category: '', // ID
        type: 'budget',
        label: '', // name of budget or category
        budget: '',
        balance: 0,
        expenses: 0,
        transAwaitingReview: 0,
      },
      add: false,
      budgetCategoryOptionsFiltered: [],
    }
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('budgets', [
      'budgets',
      'budgetCategories',
      'budgetCategoryOptions',
    ]),
  },
  methods: {
    ...mapActions('budgets', ['updateBudgetByKey']),
    createAccount() {
      createAccount(this.$route.params.id, this.newBudget)
        .then(() => {
          this.add = false
          this.newBudget = {
            category: '', // ID
            type: 'budget',
            label: '', // name of budget or category
            budget: '',
            balance: 0,
            expenses: 0,
            transAwaitingReview: 0,
          }
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Error creating account',
          })
        })
    },
    updateBudget(accountId, key, val) {
      // console.log(budgetId, key, val)
      this.updateBudgetByKey({ accountId, key, val })
      updateBudget(this.project.id, accountId, key, val)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Account: Updated Successfully',
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
    budgetCategoriesFilterFn(val, update) {
      if (val === '') {
        update(() => {
          this.budgetCategoryOptionsFiltered = this.budgetCategoryOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.budgetCategoryOptionsFiltered = this.budgetCategoryOptions.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    },
  },
  components: {
    'sp-delete-btn': defineAsyncComponent(() =>
      import('../../sp-delete-btn.vue')
    ),
    'sp-budget-import': defineAsyncComponent(() =>
      import('../../sp-budget-import.vue')
    ),
  },
}
</script>
<style scoped>
.or {
  position: relative;
  width: 100%;
  height: 40px;

  line-height: 40px;
  text-align: center;
}

.or::before,
.or::after {
  position: absolute;
  width: 40%;
  height: 1px;
  margin: 0 50px;
  top: 19px;

  background-color: #aaa;

  content: '';
}

.or::before {
  left: 0;
}

.or::after {
  right: 0;
}
</style>
