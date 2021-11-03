<template>
  <q-card style="width: 800px; max-width: 80vw">
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
          :ref="`step-${step.name}`"
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
import { mapGetters } from 'vuex'
import { updateAction, createAction } from './../../../scripts/actions.js'
import { defineAsyncComponent, readonly } from 'vue'
export default {
  name: 'withdrawPettyCash',
  props: ['actionProp'],
  data() {
    return {
      currentStep: 'gatherInfo',
      actionRef: {},
      action: {
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
      },
      error: '',
    }
  },
  created() {
    if (this['actionProp']) {
      this.action = JSON.parse(JSON.stringify(this['actionProp']))
    } else {
      let date = new Date()
      this.action.date = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    }
    for (let step of this.steps) {
      if (step.done === false) {
        this.currentStep = step.name
        break
      }
    }
  },
  computed: {
    ...mapGetters('projects', ['project']),
    steps() {
      return [
        {
          name: 'getCash',
          title: 'Get Cash from the Bank',
          icon: 'mdi-bank-transfer',
          done: this.action.done[1],
          body: {
            component: defineAsyncComponent(() => import('./getCash.vue')),
            props: { action: this.action },
          },
          actions: [
            {
              label: 'Continue',
              click: () => {
                this.error = ''
                this.action.done[1] = true
                // if (!this.action.id) {
                //   createAction(this.$route.params.id, this.action).then(
                //     (id) => {
                //       return (this.action.id = id)
                //     }
                //   )
                // } else {
                //   updateAction(this.$route.params.id, this.action.id, {
                //     done: this.action.done,
                //   })
                // }
                this.currentStep = 'pettyCash'
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'pettyCash',
          title: 'Log the Withdrawal',
          icon: 'mdi-cash-register',
          done: this.action.done[2],
          body: {
            component: defineAsyncComponent(() => import('./logTrans.vue')),
            props: { action: this.action },
          },
          actions: [
            {
              label: 'Mark Complete without fee',
              click: async () => {
                this.error = ''
                if (!this.action.id) {
                  createAction(this.$route.params.id, this.action).then(
                    (id) => {
                      return (this.action.id = id)
                    }
                  )
                }
                //save the transaction
                let res = await this.$refs[`step-pettyCash`].save()

                // console.log(id)
                if (res.error) return (this.error = res.error)
                else
                  this.action.transactions[res] = { res, purpose: 'withdrawal' }
                // mark step as done
                this.action.done[2] = true
                //update the action
                updateAction(this.$route.params.id, this.action.id, {
                  done: this.action.done,
                  transactions: this.action.transactions,
                  complete: true,
                })
                // close dialog
                this.$parent.$parent.$parent.hide()
              },
              color: 'secondary',
            },
            {
              label: 'Log fee',
              click: async () => {
                this.error = ''
                if (!this.action.id) {
                  createAction(this.$route.params.id, this.action).then(
                    (id) => {
                      return (this.action.id = id)
                    }
                  )
                }
                //save the transaction
                let res = await this.$refs[`step-pettyCash`].save()
                if (res.error) return (this.error = res.error)
                else
                  this.action.transactions[res] = { res, purpose: 'withdrawal' }
                // mark step as done
                this.action.done[2] = true
                //update the action
                updateAction(this.$route.params.id, this.action.id, {
                  done: this.action.done,
                  transactions: this.action.transactions,
                })
                // go to next step
                this.currentStep = 'pettyCashFee'
              },
              color: 'secondary',
            },
          ],
        },
        {
          name: 'pettyCashFee',
          title: 'Log the Fee (Optional)',
          icon: 'mdi-cash-register',
          done: this.action.done[3],
          body: {
            component: defineAsyncComponent(() => import('./logFees.vue')),
            props: { action: this.action },
          },
          actions: [
            {
              label: 'Skip',
              click: async () => {
                this.error = ''
                //save the transaction
                // let res = await this.$refs[`step-pettyCashFee`].save()
                // if (res.error) return (this.error = res.error)
                // else this.action.transactions[id] = { id, purpose: 'fee' }
                // console.log(this.action.transactions, id)
                // mark step as done
                //update the action
                if (this.action.id)
                  updateAction(this.$route.params.id, this.action.id, {
                    complete: true,
                  })
                // close dialog
                this.$parent.$parent.$parent.hide()
              },
              color: 'secondary',
            },
            {
              label: 'Save & Mark Complete',
              click: async () => {
                this.error = ''
                if (!this.action.id) {
                  createAction(this.$route.params.id, this.action).then(
                    (id) => {
                      return (this.action.id = id)
                    }
                  )
                }
                //save the transaction
                let res = await this.$refs[`step-pettyCashFee`].save()
                if (res.error) return (this.error = res.error)
                else this.action.transactions[res] = { res, purpose: 'fee' }

                //update the action
                updateAction(this.$route.params.id, this.action.id, {
                  transactions: this.action.transactions,
                  complete: true,
                })

                // close dialog
                this.$parent.$parent.$parent.hide()
              },
              color: 'secondary',
            },
          ],
        },
      ]
    },
  },
}
</script>
