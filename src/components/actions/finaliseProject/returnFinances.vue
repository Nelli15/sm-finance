<template>
  <div>
    <q-item class="justify-center">
      Transfer the remaining finances, which should equal ${{
        remainingBalance
      }}, to National Summer Projects bank account in one transaction.<br />Name:
      Summer Projects<br />BSB: 064433<br />Account Number: 10577799<br />Reference:
      {{ project.number ? project.number : '*Project Code*' }} Balance
    </q-item>
    <transForm
        ref="transFormRef"
        :fields="['date', 'amount', 'receipt']"
        hideBtns
        hideHeaders
        hideErrors
        :transaction="newTrans"
        @onSubmit="emit('onSubmit', $event)"
        @onError="emit('onError', $event)"
      />
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import currency from 'currency.js'
import { Transaction } from '/src/services/transaction'

export default {
  name: 'returnFinances',
  props: ['action'],
  emit: ['onError', 'onSubmit'],
  setup(props, { emit }) {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    let date = new Date()
    const transFormRef = ref({})
    const newTrans = ref(
      new Transaction({
        action: 'close',
        id: 'lastTrans',
        budget: 'debitCard',
        type: 'Internet Transfer',
        GST: 0,
        desc: 'Project close',
        category: 'Expense',
        reviewed: true,
        payTo: 'National Summer Projects',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0)
      })
    )
    const project = computed(() => store.getters['projects/project'])
    const transaction = computed(
      () => store.state.transactions.transactions.lastTrans
    )
    watch(
      transaction,
      () => {
        if (transaction.value) newTrans.value = transaction.value.duplicate()
      },
      { immediate: true }
    )
    const remainingBalance = computed(() => {
      return store.state.budgets.accounts.debitCard.balance
    })
    async function save(actionId) {
      return await transFormRef.value.onSubmit(
        actionId || props.action.id || ''
      )
    }
    return { newTrans, transFormRef, save, emit, remainingBalance, project }
  },
  components: {
    transForm: defineAsyncComponent(() => import('./../../transForm.vue')),
  },
}
</script>
