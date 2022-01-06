<template>
  <q-list>
    <transForm
      ref="transFormRef"
      :fields="['date', 'amount', 'receipt', 'payTo']"
      hideBtns
      hideHeaders
      hideErrors
      :transaction="newTrans"
      @onSubmit="emit('onSubmit', $event)"
      @onError="emit('onError', $event)"
    />
  </q-list>
</template>

<script>
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { ref, watch, defineAsyncComponent } from 'vue'
import currency from 'currency.js'
import { Transaction } from '/src/services/transaction'

export default {
  props: ['action'],
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
        budget: 'debitCard',
        type: 'Bank Card',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0),
        GST: currency(0),
        receipt: false,
        desc: 'petty cash out - fee',
        category: 'Expense',
        reviewed: true,
        payTo: '',
      })
    )
    function findTransaction() {
      let transArray = Object.values(props.action.transactions)
      for (let key in transArray) {
        let trans = transArray[key]
        if (trans.purpose === 'fee') {
          newTrans.value = store.state.transactions.transactions[trans.id]
          return newTrans.value
        }
      }
    }
    watch(
      props,
      () => {
        findTransaction()
      },
      { immediate: true, deep: true }
    )
    watch(
      store.state.transactions.transactions,
      () => {
        findTransaction()
      },
      { immediate: true, deep: true }
    )
    async function save(actionId) {
      return await transFormRef.value.onSubmit(
        actionId || props.action.id || ''
      )
    }
    return { newTrans, transFormRef, save, emit }
  },
  components: {
    transForm: defineAsyncComponent(() => import('./../../transForm.vue')),
  },
}
</script>
