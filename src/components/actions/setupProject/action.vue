<template>
  <q-card style="width: 800px; max-width: 80vw" ref="parentRef">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6"></div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-banner v-if="error" class="text-white bg-red"
      ><template v-slot:avatar><q-icon name="warning" size="lg" /></template
      >{{ error }}</q-banner
    >
    <q-stepper
      v-model="currentStep"
      vertical
      color="primary"
      animated
      header-nav
    >
      <q-step
        v-for="(step, index) in steps"
        :key="index"
        :name="step.name"
        :title="step.title"
        :icon="step.icon"
        :done="step.done"
      >
        <div v-if="step.body.text">{{ step.body }}</div>
        <component
          v-if="step.body.component"
          :is="step.body.component"
          v-bind="step.body.props"
          :ref="(el) => generateRefs(el, `step-${step.name}`)"
        />

        <q-stepper-navigation>
          <q-banner inline-actions>
            <template v-slot:action>
              <q-btn
                v-for="(action, index2) in step.actions"
                :key="index2"
                @click="action.click"
                :color="action.color"
                :label="action.label"
                :icon="action.icon"
                class="q-ml-sm"
              />
            </template>
          </q-banner>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-card>
</template>

<script>
import { updateAction, createAction } from './../../../scripts/actions.js'
import { setDoc, doc, getFirestore, getDoc } from 'firebase/firestore'
import {
  defineAsyncComponent,
  ref,
  shallowRef,
  computed,
  onBeforeUpdate,
  reactive,
} from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'setupProject',
  setup() {
    const store = useStore()
    const route = useRoute()
    const refs = reactive({})
    const parentRef = ref({})
    const currentStep = ref('gatherInfo')
    const action = ref({
      type: 'setup',
      date: '',
      transactions: {},
      complete: false,
      done: {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
      },
    })
    const error = ref('')
    // sync the action with firebase
    getDoc(
      doc(getFirestore(), `/projects/${route.params.id}/actions/setup`)
    ).then((snap) => {
      if (snap.exists()) {
        // action = snap.data()
        Object.assign(action.value, snap.data())
        // move to the next uncomplete step
        for (let step of steps.value) {
          if (step.done === false) {
            currentStep.value = step.name
            break
          }
        }
        if (currentStep.value === '') currentStep.value = 'gatherInfo'
      } else {
        setDoc(
          doc(getFirestore(), `/projects/${route.params.id}/actions/setup`),
          action.value
        )
      }
    })
    const steps = computed(() => [
      {
        name: 'gatherInfo',
        title: 'Confirm Project information',
        icon: 'settings',
        done: action.value.done[1],
        body: {
          component: defineAsyncComponent(() => import('./gatherInfo.vue')),
        },
        actions: [
          {
            label: 'Save & Continue',
            click: async () => {
              let res = await refs[`step-gatherInfo`].save()
              if (res) {
                error.value = ''
                action.value.done[1] = true
                updateAction(route.params.id, 'setup', {
                  done: action.value.done,
                })
                currentStep.value = 'accounts'
              } else {
                error.value = 'Missing information, please complete all fields'
                action.value.done[1] = false
                updateAction(route.params.id, 'setup', {
                  done: action.value.done,
                })
              }
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'accounts',
        title: 'Create Accounts',
        icon: 'account_balance',
        done: action.value.done[2],
        body: {
          component: defineAsyncComponent(() => import('./createAccounts.vue')),
        },
        actions: [
          {
            icon: 'add',
            label: 'Add Account',
            click: () => {
              refs[`step-accounts`].add = !refs[`step-accounts`].add
            },
            color: 'positive',
          },
          {
            label: 'Continue',
            click: () => {
              // console.log(refs[`step-accounts`].accounts)
              if (Object.values(refs[`step-accounts`].accounts).length > 0)
                action.value.done[2] = true
              else action.value.done[2] = false
              updateAction(route.params.id, 'setup', {
                done: action.value.done,
              })
              currentStep.value = 'categories'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'categories',
        title: 'Create Categories',
        icon: 'category',
        done: action.value.done[3],
        body: {
          component: defineAsyncComponent(() => import('./createCategory.vue')),
        },
        actions: [
          {
            icon: 'add',
            label: 'Add Category',
            click: () => {
              refs[`step-categories`].add = !refs[`step-categories`].add
            },
            color: 'positive',
          },
          {
            label: 'Continue',
            click: () => {
              if (
                Object.values(refs[`step-categories`].budgetCategories).length >
                0
              )
                action.value.done[3] = true
              else action.value.done[3] = false
              updateAction(route.params.id, 'setup', {
                done: action.value.done,
              })
              currentStep.value = 'budgets'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'budgets',
        title: 'Create Budgets',
        icon: 'reorder',
        done: action.value.done[4],
        body: {
          component: defineAsyncComponent(() => import('./createBudget.vue')),
        },
        actions: [
          {
            icon: 'add',
            label: 'Add Budgets',
            click: () => {
              refs[`step-budgets`].add = !refs[`step-budgets`].add
            },
            color: 'positive',
          },
          {
            label: 'Continue',
            click: () => {
              if (Object.values(refs[`step-budgets`].budgets).length > 0)
                action.value.done[4] = true
              else action.value.done[4] = false
              updateAction(route.params.id, 'setup', {
                done: action.value.done,
              })
              currentStep.value = 'access'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'access',
        title: 'Add Contributors',
        icon: 'people',
        done: action.value.done[5],
        body: {
          component: defineAsyncComponent(() => import('./manageAccess.vue')),
        },
        actions: [
          {
            icon: 'add',
            label: 'Invite Contributors',
            click: () => {
              refs[`step-access`].add = !refs[`step-access`].add
            },
            color: 'positive',
          },
          {
            label: 'Continue',
            click: () => {
              action.value.done[5] = true
              updateAction(route.params.id, 'setup', {
                done: action.value.done,
              })
              currentStep.value = 'firstTrans'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'firstTrans',
        title: 'Income from National Summer Projects',
        icon: 'mdi-bank-transfer',
        done: action.value.done[6],
        body: {
          component: defineAsyncComponent(() => import('./firstTrans.vue')),
        },
        actions: [
          // {
          //   label: 'Clear',
          //   click: () => {
          //     console.log(refs[`step-firstTrans`])
          //     refs[`step-firstTrans`].onReset()
          //   },
          //   color: 'secondary',
          // },
          {
            label: 'Save & Continue',
            click: () => {
              let res = refs[`step-firstTrans`].onSubmit()
              if (res) {
                error.value = ''
                action.value.done[6] = true
                updateAction(route.params.id, 'setup', {
                  done: action.value.done,
                })
                currentStep.value = 'pettyCash'
              } else {
                error.value = 'Missing information, please complete all fields'
                action.value.done[6] = false
                updateAction(route.params.id, 'setup', {
                  done: action.value.done,
                })
              }
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'pettyCash',
        title: 'Setup Petty Cash',
        icon: 'mdi-cash-register',
        done: action.value.complete,
        body: {
          component: defineAsyncComponent(() => import('./setupPettyCash.vue')),
        },
        actions: [
          {
            label: 'Mark Complete',
            click: () => {
              updateAction(route.params.id, 'setup', {
                complete: true,
              })
              parentRef.value.$parent.$parent.$parent.$parent.hide()
            },
            color: 'secondary',
          },
        ],
      },
    ])

    function generateRefs(el, id) {
      if (el && id) {
        refs[id] = el
      }
    }

    onBeforeUpdate(() => {
      refs = []
    })

    return {
      currentStep,
      action,
      generateRefs,
      steps,
      refs,
      parentRef,
      error,
    }
  },
}
</script>
