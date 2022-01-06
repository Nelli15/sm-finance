<template>
  <q-card style="width: 800px; max-width: 80vw" ref="parentRef">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Finalise Project</div>
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
import {
  defineAsyncComponent,
  ref,
  shallowRef,
  computed,
  onBeforeUpdate,
  reactive,
} from 'vue'
import { updateAction } from './../../../scripts/actions.js'
import { useStore } from 'vuex'
import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore'
import { useRoute } from 'vue-router'
import { removeUser } from '../../../scripts/access.js'
import { useQuasar } from 'quasar'

export default {
  name: 'finaliseProject',
  setup() {
    const store = useStore()
    const q = useQuasar()
    const route = useRoute()
    const refs = reactive({})
    const parentRef = ref({})
    const currentStep = ref('verifyInfo')
    const error = ref('')
    const action = reactive({
      id: 'close',
      type: 'close',
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
    getDoc(
      doc(getFirestore(), `/projects/${route.params.id}/actions/close`)
    ).then((snap) => {
      if (snap.exists()) {
        // action = snap.data()
        Object.assign(action, snap.data())
        // move to the next uncomplete step
        for (let step of steps.value) {
          if (step.done === false) {
            currentStep.value = step.name
            break
          }
        }
        if (currentStep.value === '') currentStep.value = 'verifyInfo'
      } else {
        setDoc(
          doc(getFirestore(), `/projects/${route.params.id}/actions/close`),
          action
        )
      }
    })
    const project = computed(() => store.getters['projects/project'])
    const contributors = computed(() => store.getters['auth/contributors'])
    const steps = computed(() => [
      {
        name: 'verifyInfo',
        title: 'Verify Integrity of your records',
        icon: 'settings',
        done: action.done[1],
        body: {
          component: defineAsyncComponent(() => import('./verifyInfo.vue')),
        },
        actions: [
          {
            label: 'Verify and Continue',
            click: async () => {
              error.value = ''
              let res = await refs[`step-verifyInfo`].verify()
              if (res.error) {
                return (error.value = res.error)
              }

              // mark step as done
              action.done[1] = true
              //update the action
              updateAction(route.params.id, 'close', {
                done: action.done,
              })
              currentStep.value = 'manageAccess'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'manageAccess',
        title: 'Revoke Access for unrequired contributors',
        icon: 'people',
        done: action.done[2],
        body: {
          component: defineAsyncComponent(() => import('./manageAccess.vue')),
        },
        actions: [
          {
            label: 'Revoke Contributor Access',
            click: async () => {
              for (let contributor in contributors.value) {
                removeUser(route.params.id, contributors.value[contributor].uid)
                  .then(() => {
                    // console.log('updated')
                    q.notify({
                      color: 'positive',
                      textColor: 'white',
                      icon: 'cloud_done',
                      message: 'User Removed Successfully',
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
              // // mark step as done
              // action.done[2] = true
              // //update the action
              // updateAction(route.params.id, 'close', {
              //   done: action.done,
              // })
              // currentStep.value = 'depositCash'
            },
            color: 'warning',
          },
          {
            label: 'Continue',
            click: () => {
              // mark step as done
              action.done[2] = true
              //update the action
              updateAction(route.params.id, 'close', {
                done: action.done,
              })
              currentStep.value = 'depositCash'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'depositCash',
        title: 'Deposit the petty cash onto the cash card ',
        icon: 'account_balance',
        done: action.done[3],
        body: {
          component: defineAsyncComponent(() => import('./depositCash.vue')),
          events: {
            onSubmit: (res) => {
              action.transactions[res.id] = { id: res.id, purpose: 'deposit' }
              // mark step as done
              action.done[3] = true
              //update the action
              updateAction(route.params.id, 'close', {
                done: action.done,
                transactions: action.transactions,
              })
              currentStep.value = 'returnFinances'
            },
            onError: (error) => {
              error.value = error
            },
          },
        },
        actions: [
          {
            label: 'Save & Continue',
            click: async () => {
              error.value = ''
              //save the transaction
              await refs[`step-depositCash`].save(action.id)
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'returnFinances',
        title:
          'Returning the remaining Project finances to National Summer Projects',
        icon: 'category',
        done: action.done[3],
        body: {
          component: defineAsyncComponent(() => import('./returnFinances.vue')),
          events: {
            onSubmit: (res) => {
              action.transactions[res.id] = {
                id: res.id,
                purpose: 'returnToNSP',
              }
              // mark step as done
              action.done[3] = true
              //update the action
              updateAction(route.params.id, 'close', {
                done: action.done,
                transactions: action.transactions,
              })
              currentStep.value = 'downloadBankStatement'
            },
            onError: (error) => {
              error.value = error
            },
          },
        },
        actions: [
          {
            label: 'Save & Continue',
            click: async () => {
              error.value = ''
              //save the transaction
              await refs[`step-returnFinances`].save(action.id)
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'downloadBankStatement',
        title: 'Download the bank statement for the cash card',
        icon: 'people',
        done: action.done[4],
        body: {
          component: defineAsyncComponent(() =>
            import('./downloadBankStatement.vue')
          ),
        },
        actions: [
          {
            label: 'Mark Complete',
            click: () => {
              // mark step as done
              action.done[4] = true
              //update the action
              updateAction(route.params.id, 'close', {
                done: action.done,
              })
              currentStep.value = 'sendReceipts'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'sendReceipts',
        title: 'Post the receipts to the Brisbane Campus Office',
        icon: 'mdi-bank-transfer',
        done: action.done[5],
        body: {
          component: defineAsyncComponent(() => import('./sendReceipts.vue')),
        },
        actions: [
          {
            label: 'Continue',
            click: () => {
              // mark step as done
              action.done[5] = true
              //update the action
              updateAction(route.params.id, 'close', {
                done: action.done,
              })
              currentStep.value = 'emailNSP'
            },
            color: 'secondary',
          },
        ],
      },
      {
        name: 'emailNSP',
        title: 'Email documents to National Summer Projects',
        icon: 'mdi-cash-register',
        done: action.complete,
        body: {
          component: defineAsyncComponent(() => import('./emailNSP.vue')),
        },
        actions: [
          {
            label: 'Export CSV',
            icon: 'import_export',
            click: async () => {
              let res = await refs[`step-emailNSP`].onCSVExport(route.params.id)
            },
            color: 'positive',
          },
          {
            label: 'Export Zip',
            icon: 'import_export',
            click: async () => {
              let res = await refs[`step-emailNSP`].onZipExport(route.params.id)
            },
            color: 'positive',
          },
          {
            label: 'Finish',
            click: () => {
              //update the action
              updateAction(route.params.id, 'close', {
                complete: true,
              })
              console.log(parentRef.value)
              parentRef.value.$parent.$parent.$parent.$parent.hide()
            },
            color: 'secondary',
          },
        ],
      },
    ])

    // move to the next uncomplete step
    for (let step of steps.value) {
      if (step.done === false) {
        currentStep.value = step.name
        break
      }
    }

    function generateRefs(el, id) {
      if (el && id) {
        refs[id] = el
      }
    }

    onBeforeUpdate(() => {
      refs = []
    })

    return { currentStep, action, generateRefs, steps, refs, error, parentRef }
  },
}
</script>
