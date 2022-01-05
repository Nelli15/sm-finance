<template>
  <div>
    <q-list>
      <q-item>
        Take the remaining petty cash which should equal ${{
          remainingPettyCash
        }}, to a bank branch and deposit it onto the cash card. Ask for a
        receipt for this transaction. Record the date you deposited the cash
        along with the amount deposited below.
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
    </q-list>
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
  name: 'depositCash',
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
        id: 'pettyClose',
        action: 'close',
        from: 'pettyCash',
        to: 'debitCard',
        type: 'Cash',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0),
        desc: 'petty cash close',
        category: 'Journal',
        reviewed: true,
      })
    )
    const remainingPettyCash = computed(() => {
      return store.state.budgets.accounts.pettyCash.balance
    })
    const transaction = computed(
      () => store.state.transactions.transactions.pettyClose
    )
    watch(
      transaction,
      () => {
        if (transaction.value) newTrans.value = transaction.value.duplicate()
      },
      { immediate: true }
    )
    async function save(actionId) {
      return await transFormRef.value.onSubmit(
        actionId || props.action.id || ''
      )
    }
    return { newTrans, transFormRef, save, emit, remainingPettyCash }
  },
  components: {
    transForm: defineAsyncComponent(() => import('./../../transForm.vue')),
  },
}
</script>
