<template>
  <div>
     Once all of the expenses have been logged, you need to get the remaining
    money back from
    {{
      responsiblePerson.uid ? responsiblePerson.name : 'the Responsible Person'
    }}. You should expect to receive a total of
    <b>{{ remainingBalance ? (remainingBalance).format() : currency(0).format() }}</b>
    in cash{{
      newTrans.amount.value > 0 && !amountReturned
        ? `, an additional
    ${
      remainingBalance.subtract(newTrans.amount.value > 0 ? newTrans.amount : currency(0)).format()
    }.`
        : '.'
    }}
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
  name: 'ReceiveCash',
  props: ['action', 'responsiblePerson'],
  emit: ['onError', 'onSubmit'],
  setup(props, { emit }) {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    let date = new Date()
    const transFormRef = ref({})
    const users = computed(() => {
      let arr = [...store.getters['auth/admins'], ...store.getters['auth/contributors']]
      return arr.reduce(
        (obj, item) => ({
          ...obj,
          [item['uid']]: item,
        }),
        {}
      )
    })
    const newTrans = ref(new Transaction({
        to: 'pettyCash',
        from: props.action.budget,
        type: 'Cash',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0),
        desc: `Return of remaining cash from ${
      users.value[props.action.responsiblePerson]
    } for ${
      props.action.desc.split('for ')[
        props.action.desc.split('for ').length - 1
      ]
    }`,
        category: 'Journal',
        reviewed: true,
      }))
      const remainingBalance = computed(() => {
      let total = currency(0)
      for (let trans in props.action.transactions) {
        console.log(props.action.transactions[trans], store.state.transactions.transactions[trans].amount.value)
        if (props.action.transactions[trans].purpose === 'cash-in-hand') {

          total = total.add(
            (store.state.transactions.transactions[trans] && store.state.transactions.transactions[trans].amount.value > 0)
              ? store.state.transactions.transactions[trans].amount
              : 0
          )
        } else if (props.action.transactions[trans].purpose === 'expense') {
          console.log(total.value, store.state.transactions.transactions[trans].amount.value)
          total = total.subtract(
            (store.state.transactions.transactions[trans] && store.state.transactions.transactions[trans].amount.value > 0)
              ? store.state.transactions.transactions[trans].amount
              : 0
          )
        }
        // else if (
        //   props.action.transactions[trans].purpose === 'cash-returned'
        // ) {
        //   total -= (
        //     store.getters['transactions/transFromList'](props.action.transactions)[trans] && store.getters['transactions/transFromList'](props.action.transactions)[trans].amount > 0
        //       ? store.getters['transactions/transFromList'](props.action.transactions)[trans].amount
        //       : 0
        //   )
        // }
      }
      return total
    })
    const amountReturned = computed(() => {
      return (
        remainingBalance.value -
          (newTrans.value.amount.value > 0 ? newTrans.value.amount : currency(0)).value <
        0.05
      )
    })
    
      function findTransaction() {
      let transArray = Object.values(props.action.transactions)
         for (let key in transArray) {
           let trans = transArray[key]
        if (trans.purpose === 'cash-returned') {
          newTrans.value = store.state.transactions.transactions[trans.id]
          return newTrans.value
        }
      }
    }
     const budgets = computed(() => store.getters['budgets/budgets'])
    watch(props, () => {
     findTransaction()
    }, { immediate: true, deep: true})
    watch(store.state.transactions.transactions, () => {
     findTransaction()
    }, { immediate: true, deep: true})
    async function save(actionId) {
      return await transFormRef.value.onSubmit(actionId || props.action.id || '')
    }
    return { newTrans, transFormRef, save, emit, responsiblePerson: props.responsiblePerson, budgets, remainingBalance, amountReturned}
  },
  components: {
    transForm: defineAsyncComponent(()=> import('./../../transForm.vue'))
  }
}
</script>
