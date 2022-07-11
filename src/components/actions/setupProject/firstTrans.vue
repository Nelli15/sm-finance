<template>
  <div>
    <q-list>
      <q-item>
        Before the Project starts, National Summer Missions will transfer your
        total Project finances onto the cash card. You will receive an email
        letting you know how much was transferred and when. When you receive the
        transaction in your cash card, record the date (the date the money
        arrived in the account) amount below. This is your first income
        transaction, if you recieve any further income you can record it using a
        manual Income transaction.
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
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import currency from 'currency.js'
import { Transaction } from '/src/services/transaction'

export default {
  name: 'firstTransaction',
  setup(props, { emit }) {
    const store = useStore()
    const transFormRef = ref({})
    let date = new Date()
    const newTrans = ref(
      new Transaction({
        id: 'firstTrans',
        action: 'setup',
        budget: 'debitCard',
        type: 'Internet Transfer',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0),
        desc: 'Cash Card Load from SP',
        category: 'Income',
        reviewed: true,
      })
    )
    async function save(actionId) {
      console.log(actionId)
      return await transFormRef.value.onSubmit(
        actionId || props.action.id || ''
      )
    }
    const transaction = computed(
      () => store.state.transactions.transactions.firstTrans
    )
    watch(
      transaction,
      () => {
        if (transaction.value) newTrans.value = transaction.value.duplicate()
      },
      { immediate: true }
    )
    return { newTrans, save, transFormRef, emit }
  },
  components: {
    transForm: defineAsyncComponent(() => import('./../../transForm.vue')),
  },
}
</script>
