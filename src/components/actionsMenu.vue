<template>
  <q-card>
    <q-list>
      <q-item class="text-bold"> <q-item-section label> Actions - What would you like to do? </q-item-section></q-item>
      <q-item
        v-for="(action, index) in actions"
        :key="index"
        clickable
        @click="openDialog(`action-${action.type}-dialog`)"
      >
        <q-item-section avatar v-if="action.icon" side>
          <q-icon :name="action.icon" />
        </q-item-section>
        <q-item-section>
          {{ action.label }}
        </q-item-section>
        <q-dialog
          :ref="(el) => generateRefs(el, `action-${action.type}-dialog`)"
          maximised
        >
          <component
            v-if="action.component"
            :is="action.component.component"
            v-bind="action.component.props"
            v-on="action.component.models"
          ></component>
        </q-dialog>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
import { defineAsyncComponent, shallowRef, ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
export default {
  name: 'actionsMenu',
  setup(props) {
    const route = useRoute()
    const refs = reactive({})
    const actions = shallowRef([
      {
        icon: 'settings',
        label: 'Setup Project',
        type: 'setupProject',
        component: {
          component: defineAsyncComponent(() =>
            import('./actions/setupProject/action.vue')
          ),
          props: {},
          models: {},
        },
      },
      {
         icon: 'mdi-cash-register',
        label: 'Withdraw Petty Cash',
        type: 'withdrawPettyCash',
        component: {
          component: defineAsyncComponent(() =>
            import('./actions/managePettyCash/action.vue')
          ),
          props: {},
          models: {},
        },
      },
      {
         icon: 'mdi-cash',
        label: 'Cash in hand for future Expense',
        type: 'cashInHand',
        component: {
          component: defineAsyncComponent(() =>
            import('./actions/cashInHand/action.vue')
          ),
          props: {},
          models: {},
        },
      },
      {
         icon: 'mdi-cash-refund',
        label: 'Reimburse Expense',
        type: 'reimburseExpense',
        component: {
          component: defineAsyncComponent(() =>
            import('./actions/reimbursement/action.vue')
          ),
          props: {},
          models: {},
        },
      },
      {
         icon: 'task_alt',
        label: 'Finalise Project',
        type: 'finaliseProject',
        component: {
          component: defineAsyncComponent(() =>
            import('./actions/finaliseProject/action.vue')
          ),
          props: {},
          models: {},
        },
      },
      {
        icon: 'mdi-dots-vertical',
        label: 'Other',
        type: 'manualTransaction',
        component: {
          component: defineAsyncComponent(() => import('./sp-budget-form.vue')),
          props: {
            projectId: route.params.id,
            show: 'transaction',
          },
          models: {
            onSubmit: () => {
              // this.$parent.$parent.$parent.$parent.$parent.$refs[
              //   `action-manualTransaction-dialog`
              // ][0].hide()
            },
          },
        },
      },
    ])
    const generateRefs = (el, id) => {
      if (el && id) {
        refs[id] = el
      }
    }
    const openDialog = (id) => {
      return refs[id].show()
    }
    return { actions, generateRefs, openDialog, refs }
  },
}
</script>
