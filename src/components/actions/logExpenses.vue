<template>
  <div>
    <q-list>
      Record all the Expenses related to this Reimbursement below.
      <!-- </q-item> -->
      <transactions-table
        :transactions="transArray"
        :columnsProp="[
          'submittedBy',
          'date',
          'amount',
          'GST',
          'payTo',
          'desc',
          'actions',
        ]"
        @onTransUpdate="updateTrans"
        @deleted="emit('deleted', $event)"
        showReviewed
      />
      <transForm
        v-if="add"
        ref="transFormRef"
        :fields="['date', 'amount', 'receipt', 'desc', 'payTo', 'GST']"
        hideHeaders
        hideErrors
        :actionId="action.id"
        :transaction="newTrans"
        @onSubmit="emit('onSubmit', $event)"
        @onError="emit('onError', $event)"
      />
    </q-list>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { defineAsyncComponent, ref, computed } from 'vue'
import { updateTransactionByKey } from '../../scripts/transactions.js'
import currency from 'currency.js'
import { Transaction } from '/src/services/transaction'

export default {
  props: ['action', 'transactions'],
  emit: ['onSubmit', 'onError'],
  setup(props, { emit }) {
    console.log('here')
    const q = useQuasar()
    const route = useRoute()
    const store = useStore()
    const add = ref(false)
    let date = new Date()
    const newTrans = ref(
      new Transaction({
        budget: props.action.budget,
        type: 'Cash',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${date.getFullYear()}`,
        amount: currency(0),
        GST: currency(0),
        receipt: false,
        desc: '',
        category: 'Expense',
        reviewed: false,
        action: props.action.id,
      })
    )
    function updateTrans({ trans, key, val }) {
      console.log({ trans, key, val })
      if (key === 'GST' && val > store.getters['transactions/transFromList'](
        props.action.transactions
      )[trans].amount * 0.1) {
        q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'GST must be <= Amount',
        })
        return
      }

      // updateTransactionByKey({ transId, key, val })
      emit('onTransUpdate', { trans, key, val })
      updateTransactionByKey(route.params.id, trans, key, val)
        .then(() => {
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Transaction: Updated Successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    }
    const transArray = computed(() => {
      let trans = store.getters['transactions/transFromList'](
        props.action.transactions
      )
      return trans.filter((val) => {
        return val.category === 'Expense'
      })
    })
    return { transArray, add, updateTrans, newTrans, emit }
  },
  components: {
    'transactions-table': defineAsyncComponent(() =>
      import('./../transactionsTable.vue')
    ),
    transForm: defineAsyncComponent(() => import('./../transForm.vue')),
  },
}
</script>
