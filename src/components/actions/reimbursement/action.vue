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
          v-on="step.body.events && step.body.events"
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
import { updateAction } from './../../../scripts/actions.js'
import { defineAsyncComponent, ref, computed, watch } from 'vue'
import {
  getFirestore,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  collection,
} from 'firebase/firestore'
export default {
  name: 'reimbursement',
  props: ['actionProp'],
  setup(props) {
    const store = useStore()
    const route = useRoute()
    const refs = ref({})
    const parentRef = ref({})
    const currentStep = ref('gatherInfo')
    const error = ref('')
    const action = ref({
      type: 'reimbursement',
      desc: 'Reimbursement for ',
      date: '',
      transactions: {},
      complete: false,
      done: {
        1: false,
        2: false,
        3: false,
      },
    })

    if (props.actionProp) {
      action.value = JSON.parse(JSON.stringify(props.actionProp))
    }
    const transactions = computed(
      () => store.getters['transactions/transactions']
    )
    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])
    const responsiblePerson = computed(() => {
      return admins.value.length > 0 &&
        admins.value.find((x) => x.uid === action.value.responsiblePerson)
        ? admins.value.find((x) => x.uid === action.value.responsiblePerson)
        : contributors.value.length > 0 &&
          contributors.value.find(
            (x) => x.uid === action.value.responsiblePerson
          )
        ? contributors.value.find(
            (x) => x.uid === action.value.responsiblePerson
          )
        : {}
    })
    const project = computed(() => store.getters['projects/project'])
    function fetchTransWithRef(val) {
      return store.dispatch('transactions/fetchTransWithRef', val)
    }
    // const idToken = computed(() => store.getters['auth/idToken'])
    // async function getReceipt(projectId, idToken, transId) {
    //   // return firebase.auth().onAuthStateChanged(async (user) => {
    //   // console.log(idToken, transId, projectId)
    //   if (idToken > '' && transId > '' && projectId > '') {
    //     const src = `/receipt?projectId=${projectId}&id=${transId}`
    //     const options = {
    //       headers: {
    //         Authorization: `Bearer ${idToken}`,
    //       },
    //     }

    //     let res = await fetch(src, options)
    //     // console.log(transId, res)
    //     let url = await res.text()
    //     // console.log(url)
    //     return url
    //   }

    //   // })
    // }
    const steps = computed(() => {
      return [
        {
          name: 'gatherInfo',
          title: 'Reimbursement Info',
          icon: 'mdi-bank-transfer',
          done: action.value.done[1],
          body: {
            component: defineAsyncComponent(() => import('./gatherInfo.vue')),
            props: { action: action.value },
            events: {
              actionChanged: (val) => {
                if (action.value.budget !== val.budget) {
                  for (let trans in val.transactions) {
                    if (val.transactions[trans].purpose === 'expense') {
                      updateDoc(
                        doc(
                          getFirestore(),
                          `/projects/${route.params.id}/transactions/${trans}`
                        ),
                        { budget: val.budget }
                      )
                    } else if (
                      val.transactions[trans].purpose === 'reimbursement'
                    ) {
                      updateDoc(
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
            component: defineAsyncComponent(() => import('./logExpenses.vue')),
            props: { action: action.value, transactions: transactions.value },
            events: {
              onSubmit: async (transaction) => {
                action.value.transactions[transaction.id] = {
                  id: transaction.id,
                  purpose: 'expense',
                }
                //update the action
                updateAction(route.params.id, action.value.id, {
                  // done: action.value.done,
                  transactions: action.value.transactions,
                })
                transaction.currency =
                  transaction.currency > '' ? transaction.currency : 'AUD'
                transaction.deleted = transaction.deleted
                  ? transaction.deleted
                  : false
                // if (transaction.receipt === true) {
                // transaction.receiptURL = await getReceipt(
                //   route.params.id,
                //   idToken,
                //   transaction.id
                // )
                // }
                transactions.value[transaction.id] = transaction
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
          title: 'Give Cash to the Responsible Person',
          icon: 'mdi-bank-transfer',
          done: action.value.done[3],
          body: {
            component: defineAsyncComponent(() => import('./giveCash.vue')),
            props: { action: action.value, transactions: transactions.value },
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
                if (refs.value[`step-giveCash`].remainingBalance >= 0.05) {
                  currentStep.value = 'giveCash'
                  return (error.value = `You need to return $${
                    refs.value[`step-giveCash`].remainingBalance
                  } in cash, please make sure the balance is $0 before marking as complete`)
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
        // {
        //   name: 'returnCash',
        //   title: 'Receive remaining Cash',
        //   icon: 'mdi-cash-register',
        //   done: action.value.complete,
        //   body: {
        //     component: defineAsyncComponent(() => import('./receiveCash.vue')),
        //     props: { action: action.value, transactions: transactions.value },
        //   },
        //   actions: [
        //     {
        //       label: 'Save',
        //       click: async () => {
        //         let id = await refs.value[`step-returnCash`].save()
        //         action.value.transactions[id] = { id, purpose: 'cash-returned' }
        //         //update the action
        //         updateAction(route.params.id, action.value.id, {
        //           done: action.value.done,
        //           transactions: action.value.transactions,
        //         })
        //       },
        //       color: 'secondary',
        //     },
        //     {
        //       label: 'Mark Complete',
        //       click: () => {
        //         if (!action.value.done[1]) {
        //           currentStep.value = 'gatherInfo'
        //           return (error.value =
        //             'Missing information, please complete all fields')
        //         }
        //         if (!action.value.done[2]) {
        //           currentStep.value = 'giveCash'
        //           return (error.value = `Please log the amount of cash you have given to the ${responsiblePerson.value.name}`)
        //         }
        //         if (
        //           Object.values(transactions.value).filter((val) => {
        //             return val.category === 'Expense'
        //           }).length < 1
        //         ) {
        //           currentStep.value = 'getReceipts'
        //           return (error.value = `You must log at least one expense transaction to complete this action`)
        //         }
        //         if (refs.value[`step-returnCash`].remainingBalance >= 0.05) {
        //           currentStep.value = 'getReceipts'
        //           return (error.value = `Missing receipts or ${
        //             responsiblePerson.value.name
        //           } need to return $${
        //             refs.value[`step-returnCash`].remainingBalance
        //           } in cash, please make sure the balance is $0 before marking as complete`)
        //         }
        //         if (refs.value[`step-returnCash`].remainingBalance >= 0.05) {
        //           return (error.value = `${responsiblePerson.value.name} has returned too many receipts or too much cash. Either pay them some of the cash back or if the expense was greater than expected you can give the ${responsiblePerson.name} the additional amount and increase the cash given in step 2.`)
        //         }
        //         action.value.complete = true
        //         updateAction(route.params.id, action.value.id, {
        //           complete: action.value.complete,
        //         })

        //         parentRef.value.$parent.$parent.$parent.$parent.hide()
        //       },
        //       color: 'positive',
        //     },
        //   ],
        // },
      ]
    })

    // function fetchTransactions() {
    //   getDocs(
    //     query(
    //       collection(
    //         getFirestore(),
    //         `/projects/${route.params.id}/transactions`
    //       ),
    //       where('action', '==', action.value.id)
    //     )
    //   ).then(async (transactionsSnap) => {
    //     let transArray = {}
    //     let promises = transactionsSnap.docs.map(async (doc) => {
    //       let transaction = doc.data()
    //       transaction.id = doc.id
    //       transaction.currency =
    //         transaction.currency > '' ? transaction.currency : 'AUD'
    //       transaction.deleted = transaction.deleted
    //         ? transaction.deleted
    //         : false
    //       // if (transaction.receipt === true) {
    //       // transaction.receiptURL = await getReceipt(
    //       //   route.params.id,
    //       //   idToken,
    //       //   transaction.id
    //       // )
    //       // }
    //       return (transArray[transaction.id] = transaction)
    //     })
    //     await Promise.all(promises)
    //     transactions.value = transArray
    //   })
    // }

    for (let step of steps.value) {
      if (step.done === false) {
        currentStep.value = step.name
        break
      }
    }
    watch(
      () => action.value.id,
      () => {
        if (action.value.id) {
          fetchTransWithRef({
            projectId: route.params.id,
            ref: query(
              collection(
                getFirestore(),
                `/projects/${route.params.id}/transactions`
              ),
              where('action', '==', action.value.id)
            ),
          })
        }
      },
      {
        immediate: true,
      }
    )
    watch(
      () => action.value.transactions,
      () => {
        if (action.value.id) {
          fetchTransWithRef({
            projectId: route.params.id,
            ref: query(
              collection(
                getFirestore(),
                `/projects/${route.params.id}/transactions`
              ),
              where('action', '==', action.value.id)
            ),
          })
        }
      },
      {
        deep: true,
        immediate: true,
      }
    )
    return { currentStep, error, steps, refs, parentRef, action }
  },
}
</script>
