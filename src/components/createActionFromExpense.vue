<template>
  <span>
    <q-btn @click="openDialog()" icon="mdi-cash-refund" dense class="q-mr-sm">
      <q-tooltip
        anchor="center right"
        self="center left"
        class="bg-accent text-black"
      >
        Reimburse
      </q-tooltip>
    </q-btn>
    <q-dialog ref="dialog" maximised>
      <reimbursement :transaction="transaction" />
    </q-dialog>
  </span>
</template>

<script>
import { ref, defineAsyncComponent } from 'vue'
export default {
  name: 'CreateActionFromExpense',
  props: ['transaction'],
  setup(props) {
    const dialog = ref({})
    function openDialog() {
      return dialog.value.show()
    }
    return { openDialog, dialog }
  },
  components: {
    reimbursement: defineAsyncComponent(() =>
      import('./actions/reimbursement/action.vue')
    ),
  },
}
</script>
