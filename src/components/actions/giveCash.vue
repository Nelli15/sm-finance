<template>
  <div>
    <div v-html="header"/>
    <div v-html="caption"/>
    <q-list>
      <transForm ref="transFormRef" :fields="['date', 'amount']" hideBtns hideHeaders hideErrors :transaction="newTrans" @onSubmit="emit('onSubmit', $event)"  @onError="emit('onError', $event)" />
    </q-list>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import {useQuasar} from 'quasar'
import { useRoute } from 'vue-router'
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import currency from 'currency.js'
import { Transaction } from '/src/services/transaction'

export default {
  props: ['action', 'header', 'caption'],
  emit: ['onError', 'onSubmit'],
  setup(props, { emit }) {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    let date = new Date()
    const transFormRef = ref({})
    const newTrans = ref(new Transaction({
        from: 'pettyCash',
        to: props.action.budget,
        type: 'Cash',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0),
        desc: props.action.desc,
        category: 'Journal',
        reviewed: true,
      }))
      function findTransaction() {
      let transArray = Object.values(props.action.transactions)
         for (let key in transArray) {
           let trans = transArray[key]
        if (props.action.type === 'cashInHand' && trans.purpose === 'cash-in-hand' || props.action.type && trans.purpose === 'reimbursement') {
          newTrans.value = store.state.transactions.transactions[trans.id]
          return newTrans.value
        }
      }
    }
     
    watch(computed(() => props.action), () => {
     findTransaction()
    }, { immediate: true, deep: true})
    watch(store.state.transactions.transactions, () => {
     findTransaction()
    }, { immediate: true, deep: true})
    async function save(actionId) {
      return await transFormRef.value.onSubmit(actionId || props.action.id || '')
    }
    return { newTrans, transFormRef, save, emit, header: props.header, caption: props.caption }
  },
  components: {
    transForm: defineAsyncComponent(()=> import('/src/components/transForm.vue'))
  }
}
</script>