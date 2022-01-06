<template>
  <q-card style="width: 800px; max-width: 80vw" ref="parentRef">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Petty Cash Withdrawal</div>
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
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { defineAsyncComponent, ref, computed, reactive } from 'vue'
import { updateAction, createAction } from './../../../scripts/actions.js'
export default {
  name: 'withdrawPettyCash',
  props: ['action'],
  setup(props, { emit }) {
    const refs = reactive({})
    const parentRef = ref({})
    const route = useRoute()
    const store = useStore()
    const currentStep = ref('gatherInfo')
    const action = ref({
      type: 'petty',
      desc: 'Withdrawing Petty Cash from the Cash Card',
      date: '',
      transactions: {},
      complete: false,
      done: {
        1: false,
        2: false,
        3: false,
      },
    })
    const ready = ref(false) // to mark complete
    const error = ref('')
    if (props.action) {
      action.value = JSON.parse(JSON.stringify(props.action))
    } else {
      let date = new Date()
      action.value.date = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    }

    const steps = computed(() => {
      return [
        {
          name: 'getCash',
          title: 'Get Cash from the Bank',
          icon: 'mdi-bank-transfer',
          done: action.value.done[1],
          body: {
            component: defineAsyncComponent(() => import('./getCash.vue')),
            props: { action: action.value },
          },
          actions: [
            {
              label: 'Continue',
              click: () => {
                error.value = ''
                action.value.done[1] = true
                currentStep.value = 'pettyCash'
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'pettyCash',
          title: 'Log the Withdrawal',
          icon: 'mdi-cash-register',
          done: action.value.done[2],
          body: {
            component: defineAsyncComponent(() => import('./logTrans.vue')),
            props: { action: action.value },
            events: {
              onSubmit: (res) => {
                if (!action.value.transactions[res.id])
                  action.value.transactions[res.id] = {
                    id: res.id,
                    purpose: 'withdrawal',
                  }
                // mark step as done
                action.value.done[2] = true
                //update the action
                updateAction(route.params.id, action.value.id, {
                  done: action.value.done,
                  transactions: action.value.transactions,
                  complete: ready.value,
                })
                if (ready.value === true) {
                  // close dialog
                  parentRef.value.$parent.$parent.$parent.$parent.hide()
                } else {
                  // go to next step
                  currentStep.value = 'pettyCashFee'
                }
              },
              onError: (error) => {
                error.value = error
              },
            },
          },

          actions: [
            {
              label: 'Mark Complete without fee',
              click: async () => {
                error.value = ''
                if (!action.value.id) {
                  await createAction(route.params.id, action.value).then(
                    (id) => {
                      return (action.value.id = id)
                    }
                  )
                }
                //save the transaction
                ready.value = true
                await refs[`step-pettyCash`].save(action.value.id)
              },
              color: 'secondary',
            },
            {
              label: 'Log fee',
              click: async () => {
                error.value = ''
                if (!action.value.id) {
                  await createAction(route.params.id, action.value).then(
                    (id) => {
                      return (action.value.id = id)
                    }
                  )
                }
                //save the transaction
                ready.value = false
                await refs[`step-pettyCash`].save(action.value.id)
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'pettyCashFee',
          title: 'Log the Fee (Optional)',
          icon: 'mdi-cash-register',
          done: action.value.done[3],
          body: {
            component: defineAsyncComponent(() => import('./logFees.vue')),
            props: { action: action.value },
            events: {
              onSubmit: (res) => {
                if (!action.value.transactions[res.id])
                  action.value.transactions[res.id] = {
                    id: res.id,
                    purpose: 'fee',
                  }
                // mark step as done
                action.value.done[2] = true
                //update the action
                updateAction(route.params.id, action.value.id, {
                  done: action.value.done,
                  transactions: action.value.transactions,
                  complete: true,
                })
                // close dialog
                parentRef.value.$parent.$parent.$parent.$parent.hide()
              },
              onError: (error) => {
                error.value = error
              },
            },
          },
          actions: [
            {
              label: 'Skip',
              click: async () => {
                error.value = ''

                //update the action
                if (action.value.id)
                  updateAction(route.params.id, action.value.id, {
                    complete: true,
                  })
                // close dialog
                parentRef.value.$parent.$parent.$parent.$parent.hide()
              },
              color: 'secondary',
            },
            {
              label: 'Save & Mark Complete',
              click: async () => {
                error.value = ''
                if (!action.value.id) {
                  await createAction(route.params.id, action.value).then(
                    (id) => {
                      return (action.value.id = id)
                    }
                  )
                }
                //save the transaction
                ready.value = true
                await refs[`step-pettyCashFee`].save(action.value.id)
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
    const generateRefs = (el, id) => {
      if (el && id) {
        refs[id] = el
      }
    }
    return { steps, action, error, currentStep, generateRefs, parentRef }
  },
}
</script>
