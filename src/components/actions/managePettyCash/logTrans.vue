<template>
  <q-list>
    Record the details of the withdrawal below.<br />
    <ul>
      <li>Date - The date you withdrew the Petty Cash</li>
      <li>Amount - The amount you withdrew.</li>
    </ul>
    <transForm ref="transFormRef" :fields="['date', 'amount']" hideBtns hideHeaders hideErrors :transaction="newTrans" @onSubmit="emit('onSubmit', $event)"  @onError="emit('onError', $event)" />
  </q-list>
</template>

<script>
import { useStore } from 'vuex'
import {useQuasar} from 'quasar'
import { useRoute } from 'vue-router'
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import currency from 'currency.js'
import { Transaction } from '/src/services/transaction'

export default {
  name: 'logTrans',
  props: ['action'],
  emit: ['onError', 'onSubmit'],
  setup(props, { emit }) {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    let date = new Date()
    const transFormRef = ref({})
    const newTrans = ref(new Transaction({
        from: 'debitCard',
        to: 'pettyCash',
        type: 'Cash',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0),
        receipt: false,
        desc: 'petty cash out',
        category: 'Journal',
        reviewed: true,
      }))
      function findTransaction() {
      let transArray = Object.values(props.action.transactions)
         for (let key in transArray) {
           let trans = transArray[key]
        if (trans.purpose === 'withdrawal') {
          newTrans.value = store.state.transactions.transactions[trans.id]
          return newTrans.value
        }
      }
    }
    watch(props, () => {
     findTransaction()
    }, { immediate: true, deep: true})
    watch(store.state.transactions.transactions, () => {
     findTransaction()
    }, { immediate: true, deep: true})
    async function save(actionId) {
      return await transFormRef.value.onSubmit(actionId || props.action.id || '')
    }
    return { newTrans, transFormRef, save, emit}
  },
  components: {
    transForm: defineAsyncComponent(()=> import('./../../transForm.vue'))
  }
}
</script>
