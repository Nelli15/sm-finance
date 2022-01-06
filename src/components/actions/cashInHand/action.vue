<template>
  <q-card style="width: 800px; max-width: 80vw" ref="parentRef">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ action.desc }}</div>
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
        :disabled="step.disabled"
      >
        <div v-if="step.body.text">{{ step.body }}</div>
        <component
          v-if="step.body.component"
          :is="step.body.component"
          v-bind="step.body.props"
          :ref="
            (el) => {
              if (el) refs[`step-${step.name}`] = el
            }
          "
          v-on="step.body.events ? step.body.events : {}"
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
                :disable="action.disable"
              />
            </template>
          </q-banner>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-card>
</template>

<script>
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { defineAsyncComponent, ref, computed, watch } from 'vue'
import { updateAction } from './../../../scripts/actions.js'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import currency from 'currency.js'
export default {
  name: 'cashInHand',
  props: ['action'],
  setup(props) {
    const store = useStore()
    const route = useRoute()
    const refs = ref({})
    const parentRef = ref({})
    const currentStep = ref('gatherInfo')
    const error = ref('')
    const ready = ref(false)
    let date = new Date()
    const action = ref({
      type: 'cashInHand',
      desc: 'Cash in hand to ? for',
      date: `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`,
      transactions: {},
      complete: false,
      done: {
        1: false,
        2: false,
        3: false,
      },
      responsiblePerson: '',
    })
    if (props.action) {
      action.value = JSON.parse(JSON.stringify(props.action))
    }
    const users = computed(() => {
      let arr = [
        ...store.getters['auth/admins'],
        ...store.getters['auth/contributors'],
      ]
      return arr.reduce(
        (obj, item) => ({
          ...obj,
          [item['uid']]: item,
        }),
        {}
      )
    })
    const responsiblePerson = computed(() => {
      return action.value.responsiblePerson
        ? users.value[action.value.responsiblePerson]
        : {}
    })
    const remainingBudgetText = ref('')
    function computeCaption() {
      remainingBudgetText.value = `<q-item><q-item-label class="text-caption">Budget Remaining: ${
        action.value.budget && store.state.budgets.budgets[action.value.budget]
          ? currency(
              store.state.budgets.budgets[action.value.budget].budget.subtract(
                store.state.budgets.budgets[action.value.budget].expenses
              )
            ).format()
          : currency(0).format()
      }</q-item-label></q-item>`
    }
    watch(
      action,
      () => {
        computeCaption()
      },
      { immediate: true }
    )
    watch(
      store.state.budgets.budgets,
      () => {
        computeCaption()
      },
      { immediate: true }
    )
    const steps = computed(() => {
      return [
        {
          name: 'gatherInfo',
          title: 'Cash in Hand Info',
          icon: 'mdi-bank-transfer',
          done: action.value.done[1],
          body: {
            component: defineAsyncComponent(() =>
              import('./../gatherInfo.vue')
            ),
            props: {
              action: action.value,
              header: `A Cash in Hand action is used when you want to provide an individual with cash so they can purchase something, you should expect the receipt and remaining money returned.`,
              prependDesc: `Cash in hand`,
            },
            events: {
              onError: (error) => {
                error.value = error
              },
              actionChanged: async (val) => {
                if (action.value.budget !== val.budget) {
                  for (let trans in val.transactions) {
                    if (val.transactions[trans].purpose === 'expense') {
                      await updateDoc(
                        doc(
                          getFirestore(),
                          `/projects/${route.params.id}/transactions/${trans}`
                        ),
                        { budget: val.budget }
                      )
                    } else if (
                      val.transactions[trans].purpose === 'cash-in-hand'
                    ) {
                      await updateDoc(
                        doc(
                          getFirestore(),
                          `/projects/${route.params.id}/transactions/${trans}`
                        ),
                        { to: val.budget }
                      )
                    } else if (
                      val.transactions[trans].purpose === 'cash-returned'
                    ) {
                      await updateDoc(
                        doc(
                          getFirestore(),
                          `/projects/${route.params.id}/transactions/${trans}`
                        ),
                        { from: val.budget }
                      )
                    }
                  }
                }
                action.value = val
              },
            },
          },
          actions: [
            {
              label: 'Save & Continue',
              click: () => {
                refs.value[`step-gatherInfo`].save()
                currentStep.value = 'giveCash'
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'giveCash',
          title: `Give Cash to ${
            responsiblePerson.value.uid
              ? responsiblePerson.value.name
                ? responsiblePerson.value.name
                : responsiblePerson.value.email
              : 'the Responsible Person'
          }`,
          icon: 'mdi-bank-transfer',
          done: action.value.done[2],
          body: {
            component: defineAsyncComponent(() => import('./../giveCash.vue')),
            props: {
              action: action.value,
              responsiblePerson: responsiblePerson.value,
              header: `Give the expected cash to ${
                responsiblePerson.value.uid
                  ? responsiblePerson.value.name
                    ? responsiblePerson.value.name
                    : responsiblePerson.value.email
                  : 'the Responsible Person'
              } and record the details below.`,
              caption: remainingBudgetText.value,
            },
          },
          actions: [
            {
              label: 'Save & Continue',
              click: async () => {
                action.value.done[2] = true
                let id = await refs.value[`step-giveCash`].save()
                action.value.transactions[id] = { id, purpose: 'cash-in-hand' }
                //update the action
                updateAction(route.params.id, action.value.id, {
                  done: action.value.done,
                  transactions: action.value.transactions,
                })
                currentStep.value = 'getReceipts'
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'getReceipts',
          title: 'Log all Expenses',
          icon: 'mdi-cash-register',
          done: action.value.done[3],
          body: {
            component: defineAsyncComponent(() =>
              import('./../logExpenses.vue')
            ),
            props: {
              action: action.value,
            },
            events: {
              onSubmit: (res) => {
                console.log('onSubmitted', res)
                if (!action.value.transactions[res.id])
                  action.value.transactions[res.id] = {
                    id: res.id,
                    purpose: 'expense',
                  }
                //update the action
                updateAction(route.params.id, action.value.id, {
                  transactions: action.value.transactions,
                })
              },
              onError: (error) => {
                error.value = error
              },
              onTransUpdate: async ({ trans, key, val }) => {
                transactions.value[trans][key] = val
              },
              deleted: async (docRef) => {
                delete transactions.value[
                  docRef.split('/')[docRef.split('/').length - 1]
                ]
              },
            },
          },
          actions: [
            {
              icon: 'add',
              label: 'Add Expense',
              click: () => {
                // if (!action.value.budget) {
                //   error.value = `Please provide information about this Action before continuing.`
                //   return (currentStep.value = 'gatherInfo')
                // }
                refs.value[`step-getReceipts`].add =
                  !refs.value[`step-getReceipts`].add
              },
              color: 'positive',
            },
            {
              label: 'Mark Complete',
              click: async () => {
                if (
                  Object.values(store.state.transactions.transactions).filter(
                    (val) => {
                      return val.category === 'Expense'
                    }
                  ).length < 1
                ) {
                  currentStep.value = 'getReceipts'
                  return (error.value = `You must log at least one expense transaction to complete this action`)
                }
                // mark step as done
                action.value.done[3] = true
                //update the action
                updateAction(route.params.id, action.value.id, {
                  done: action.value.done,
                })
                // go to next step
                currentStep.value = 'returnCash'
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'returnCash',
          title: 'Receive remaining Cash',
          icon: 'mdi-cash-register',
          done: action.value.complete,
          body: {
            component: defineAsyncComponent(() => import('./receiveCash.vue')),
            props: {
              action: action.value,
              responsiblePerson: responsiblePerson.value,
            },
          },
          actions: [
            {
              label: 'Save',
              click: async () => {
                let id = await refs.value[`step-returnCash`].save()
                action.value.transactions[id] = { id, purpose: 'cash-returned' }
                //update the action
                updateAction(route.params.id, action.value.id, {
                  done: action.value.done,
                  transactions: action.value.transactions,
                })
              },
              color: 'positive',
            },
            {
              label: 'Mark Complete',
              click: () => {
                if (!action.value.done[1]) {
                  currentStep.value = 'gatherInfo'
                  return (error.value =
                    'Missing information, please complete all fields')
                }
                if (!action.value.done[2]) {
                  currentStep.value = 'giveCash'
                  return (error.value = `Please log the amount of cash you have given to ${
                    responsiblePerson.value.name
                      ? responsiblePerson.value.name
                      : responsiblePerson.value.email
                  }`)
                }
                if (
                  Object.values(store.state.transactions.transactions).filter(
                    (val) => {
                      return val.category === 'Expense'
                    }
                  ).length < 1
                ) {
                  currentStep.value = 'getReceipts'
                  return (error.value = `You must log at least one expense transaction to complete this action`)
                }
                if (!refs.value[`step-returnCash`].amountReturned) {
                  currentStep.value = 'getReceipts'
                  return (error.value = `Missing receipts or ${
                    responsiblePerson.value.name
                      ? responsiblePerson.value.name
                      : responsiblePerson.value.email
                  } needs to return $${
                    refs.value[`step-returnCash`].remainingBalance
                  } in cash, please make sure the balance is as close to $0.00 as possible before marking as complete`)
                }
                if (!refs.value[`step-returnCash`].amountReturned) {
                  return (error.value = `${
                    responsiblePerson.value.name
                      ? responsiblePerson.value.name
                      : responsiblePerson.value.email
                  } has returned too many receipts or too much cash. Either pay them some of the cash back or if the expense was greater than expected you can give the ${
                    responsiblePerson.value.name
                      ? responsiblePerson.value.name
                      : responsiblePerson.value.email
                  } the additional amount and increase the cash given in step 2.`)
                }
                action.value.complete = true
                updateAction(route.params.id, action.value.id, {
                  complete: action.value.complete,
                })

                parentRef.value.$parent.$parent.$parent.$parent.hide()
              },
              color: 'secondary',
            },
          ],
        },
      ]
    })

    for (let step of steps.value) {
      if (step.done === false) {
        currentStep.value = step.name
        break
      }
    }

    return {
      currentStep,
      error,
      steps,
      refs,
      parentRef,
      action,
      responsiblePerson,
    }
  },
}
</script>
