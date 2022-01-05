<template>
  <q-card ref="root">
    <q-form @reset="reset" @submit="submit">
    <q-card-section class="row items-center q-pb-none">
      <q-btn-toggle
            v-model="newBudget.type"
            toggle-color="primary"
            :options="[
              { label: 'Budget', value: 'budget' },
              { label: 'Category', value: 'category' },
              { label: 'Account', value: 'account' },
              { label: 'Transaction', value: 'transaction' },
            ]"
            push
            dense
            class="q-mx-auto"
          />
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
      <q-list style="min-width: 100px; min-height: 360px">
        <q-item
          class="text-h6 justify-center"
          v-if="newBudget.type !== 'transaction'"
        >
          Add
          {{ newBudget.type.charAt(0).toUpperCase() + newBudget.type.slice(1) }}

          <q-icon
            name="help_outline"
            style="cursor: pointer"
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
                    <q-card-section> Create the Budget </q-card-section>
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
                    <q-card-section> Create the Account </q-card-section>
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
          <transForm
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
            style="width: 100%"
          />
        </q-item>
        <q-item v-if="newBudget.type === 'budget'">
          <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
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
            :options="budgetCategoryOptions"
            option-label="label"
            :option-value="(item) => (item === null ? null : item.id)"
            @update:model-value="newBudget.category = $event.id"
            style="width: 100%"
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
            style="width: 100%"
            :rules="[(val) => !!val || 'Field is Required!']"
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
  </q-card>
</template>

<script>
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { defineAsyncComponent, ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'

export default {
  props: ['projectId', 'show'],
  emits: ['onSubmit'],
  setup(props) {
    const q = useQuasar()
    const store = useStore()
    const newBudget = reactive({
      category: '', // ID
      type: props.show ? props.show : 'transaction', // ['budget', 'category', 'account']
      label: '', // name of budget or category
      budget: '', // the amount budgeted
    })

    const projects = computed({
      get() {
        return store.getters['projects/projects']
      },
      set() {},
    })
    const project = computed({
      get() {
        return store.getters['projects/project']
      },
      set(value) {
        store.commit('setProject', value)
      },
    })
    const budgets = computed(() => store.getters['budgets/budgets'])
    const budgetCategories = computed(
      () => store.getters['budgets/budgetCategories']
    )
    const budgetOptions = computed(() => store.getters['budgets/budgetOptions'])
    const budgetCategoryOptions = computed(
      () => store.getters['budgets/budgetCategoryOptions']
    )

    function submit() {
      if (newBudget.type === 'budget' && newBudget.category <= '') {
        q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'Budget Category must not be blank',
        })
        return false
      }

      if (newBudget.type === 'account') {
        newBudget.inHeader = false
      }
      addDoc(
        collection(getFirestore(), `/projects/${props.projectId}/accounts`),
        newBudget
      )
        .then((res) => {
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `${newBudget.type}: ${newBudget.label} Created Successfully`,
          })
          reset()
        })
        .catch((err) => {
          console.error(err)
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    }
    function reset() {
      newBudget.category = '' // ID
      newBudget.label = '' // name of budget or category
      newBudget.budget = '' // the amount budgeted
    }
    return {
      project,
      newBudget,
      submit,
      reset,
      projects,
      budgets,
      budgetCategories,
      budgetOptions,
      budgetCategoryOptions,
    }
  },
  components: {
    'transForm': defineAsyncComponent(() =>
      import('./transForm.vue')
    ),
  },
}
</script>
