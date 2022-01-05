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
    <budgetsTable flat/>
    <div v-if="l_add">
      <q-item>
        <q-input
          label="Budget Label"
          stack-label
          v-model="l_newBudget.label"
          style="width: 100%"
        />
      </q-item>
      <q-item>
        <q-select
          :model-value="budgetCategories[l_newBudget.category] ? budgetCategories[l_newBudget.category].label : ''"
          dense
          label="Category"
          stack-label
          :options="l_budgetCategoriesFiltered"
          option-label="label"
          :option-value="(item) => (item === null ? null : item.id)"
          @update:model-value="l_newBudget.category = $event.id"
          style="width: 100%"
          use-input
          @filter="l_filterFn"
          input-debounce="0"
        />
      </q-item>
      <q-item>
        <q-input
          v-model="l_newBudget.budget"
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
          @click="l_createAccount"
          icon="send"
          label="Create"
          dense
          color="positive"
          class="full-width"
        />
      </q-item>
    </div>
    <div class="or" v-if="l_add">OR</div>
    <div v-if="l_add" class="full-width">
      <div><sp-budget-import /></div>
    </div>
  </div>
</template>

<script>
import { createAccount } from '../../../scripts/accounts.js'
import { defineAsyncComponent, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import {useStore} from 'vuex'
import {useRoute} from 'vue-router'

export default {
  name: 'createBudget',
  setup(){
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    const l_accountLabel = ref('')
    const l_add = ref(false)
    const l_newBudget = ref({
        category: '', // ID
        type: 'budget',
        label: '', // name of budget or category
        budget: '',
        balance: 0,
        expenses: 0,
        transAwaitingReview: 0,
      })
    const l_budgetCategoriesFiltered = ref([])
    const project = computed(() => store.getters['projects/project'])
    const budgetCategories = computed(() => store.getters['budgets/budgetCategories'])
    const budgetCategoryOptions = computed(() => store.getters['budgets/budgetCategoryOptions'])
    
    function l_filterFn(val, update) {
      if (val === '') {
        update(() => {
          l_budgetCategoriesFiltered.value = budgetCategoryOptions.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        l_budgetCategoriesFiltered.value = budgetCategoryOptions.value.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    }
    function l_createAccount() {
      createAccount(route.params.id, l_newBudget.value)
        .then(() => {
          l_add.value = false
          l_newBudget.value = {
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
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Error creating account',
          })
        })
    }
    return {l_add, l_accountLabel, l_newBudget, l_budgetCategoriesFiltered, budgetCategories, l_filterFn, l_createAccount, project}
  },
  components: {
    budgetsTable: defineAsyncComponent(() =>
      import('../../budgetsTable.vue')
    ),
    'sp-budget-import': defineAsyncComponent(()=> import('../../sp-budget-import.vue'))
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
