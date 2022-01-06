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
              />
            </template>
          </q-banner>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-card>
</template>

<script>
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { updateAction, createAction } from './../../../scripts/actions.js'
import { updateTransactionByKey } from '../../../scripts/transactions.js'
import { defineAsyncComponent, ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getFirestore, updateDoc, doc } from 'firebase/firestore'
import currency from 'currency.js'

export default {
  name: 'reimbursement',
  props: ['action', 'transaction'],
  setup(props) {
    const store = useStore()
    const route = useRoute()
    const q = useQuasar()
    const refs = ref({})
    const parentRef = ref({})
    const currentStep = ref('gatherInfo')
    const error = ref('')
    let date = new Date()
    const action = ref({
      type: 'reimbursement',
      desc: 'Reimbursement for ',
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
    if (props.transaction) {
      console.log(props.transaction)
      action.value.budget = props.transaction.budget
      action.value.responsiblePerson = props.transaction.submittedBy.uid
      action.value.desc = `Reimbursement for ${props.transaction.desc}`
      action.value.transactions = {
        [props.transaction.id]: {
          id: props.transaction.id,
          purpose: 'expense',
        },
      }
      let date = new Date()
      action.value.date = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`

      async function save() {
        if (action.value.id) {
          updateAction(route.params.id, action.value.id, action.value)
        } else {
          action.value.id = await createAction(route.params.id, action.value)
        }

        if (action.value.desc > '' && action.value.budget > '')
          action.value.done[1] = true
        else action.value.done[1] = false
        // updateTransactionByKey({ transId: props.transaction.id, key: 'action', val: action.value.id })
        updateTransactionByKey(
          route.params.id,
          props.transaction.id,
          'action',
          action.value.id
        )
          .then(() => {
            q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Transaction: Updated Successfully',
            })
          })
          .catch((err) => {
            console.log(err)
            q.notify({
              color: 'negative',
              textColor: 'white',
              icon: 'error',
              message: 'Oops, Something went wrong!',
            })
          })
      }
      save()
    }

    const transactions = computed(() =>
      store.getters['transactions/transFromList'](action.value.transactions)
    )
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
      return users.value[action.value.responsiblePerson]
        ? users.value[action.value.responsiblePerson]
        : {}
    })

    const remainingBalance = computed(() => {
      let total = currency(0)
      for (let trans in action.value.transactions) {
        let transaction = store.state.transactions.transactions[trans]
        if (action.value.transactions[trans].purpose === 'reimbursement') {
          total = total.subtract(transaction ? transaction.amount.value : 0)
        } else if (action.value.transactions[trans].purpose === 'expense') {
          total = total.add(transaction ? transaction.amount.value : 0)
        }
      }
      return total
    })

    const steps = computed(() => {
      return [
        {
          name: 'gatherInfo',
          title: 'Reimbursement Info',
          icon: 'mdi-bank-transfer',
          done: action.value.done[1],
          body: {
            component: defineAsyncComponent(() =>
              import('./../gatherInfo.vue')
            ),
            props: {
              action: action.value,
              header: `A Reimbursement Action is used when you receive a receipt for an approved expense that has been paid from an individuals pocket.`,
              prependDesc: `Reimbursement`,
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
                      val.transactions[trans].purpose === 'reimbursement'
                    ) {
                      await updateDoc(
                        doc(
                          getFirestore(),
                          `/projects/${route.params.id}/transactions/${trans}`
                        ),
                        { to: val.budget }
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
                error.value = ''
                refs.value[`step-gatherInfo`].save()
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
          done: action.value.done[2],
          body: {
            component: defineAsyncComponent(() =>
              import('./../logExpenses.vue')
            ),
            props: { action: action.value },
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
                refs.value[`step-getReceipts`].add =
                  !refs.value[`step-getReceipts`].add
              },
              color: 'positive',
            },
            {
              label: 'Mark Complete',
              click: async () => {
                if (
                  Object.values(transactions.value).filter((val) => {
                    return val.category === 'Expense'
                  }).length < 1
                ) {
                  currentStep.value = 'getReceipts'
                  return (error.value = `You must log at least one expense transaction to complete this action`)
                }
                // mark step as done
                action.value.done[2] = true
                //update the action
                updateAction(route.params.id, action.value.id, {
                  done: action.value.done,
                })
                // go to next step
                currentStep.value = 'giveCash'
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'giveCash',
          title: `Give cash to ${
            responsiblePerson.value.uid
              ? responsiblePerson.value.name
                ? responsiblePerson.value.name
                : responsiblePerson.value.email
              : 'the Responsible Person'
          }`,
          icon: 'mdi-bank-transfer',
          done: action.value.done[3],
          body: {
            component: defineAsyncComponent(() => import('./../giveCash.vue')),
            props: {
              action: action.value,
              transactions: transactions.value,
              header: `Give <b>&nbsp;${remainingBalance.value.format()}&nbsp;</b>  cash to ${
                responsiblePerson.value.uid
                  ? responsiblePerson.value.name
                    ? responsiblePerson.value.name
                    : responsiblePerson.value.email
                  : 'the person who paid for the expense'
              } and record the details below.`,
            },
          },
          actions: [
            {
              label: 'Save',
              click: async () => {
                let id = await refs.value[`step-giveCash`].save()
                action.value.transactions[id] = { id, purpose: 'reimbursement' }
                //update the action
                updateAction(route.params.id, action.value.id, {
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
                if (
                  Object.values(transactions.value).filter((val) => {
                    return val.category === 'Expense'
                  }).length < 1
                ) {
                  currentStep.value = 'getReceipts'
                  return (error.value = `You must log at least one expense transaction to complete this action`)
                }
                if (remainingBalance.value.value >= 0.05) {
                  currentStep.value = 'giveCash'
                  return (error.value = `You need to return ${remainingBalance.value.format()} in cash, please make sure the balance is $0 before marking as complete`)
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

    watch(action, () => {
      console.log(action.value)
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
      users,
    }
  },
}
</script>
