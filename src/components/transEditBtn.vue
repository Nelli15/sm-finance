<template>
  <q-btn icon="edit" @click="toggle" dense>
    <q-dialog ref="dialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Transaction {{ transaction.id }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <trans-form :transaction="transaction" hideHeaders
      /></q-card>
    </q-dialog>
  </q-btn>
</template>

<script>
import { ref, defineAsyncComponent } from 'vue'
export default {
  name: 'TransEditBtn',
  props: ['transaction'],
  setup(props) {
    const dialog = ref(null)
    function toggle() {
      dialog.value.toggle()
    }
    return { dialog, toggle }
  },
  components: {
    'trans-form': defineAsyncComponent(() => import('./transForm.vue')),
  },
}
</script>
