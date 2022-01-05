<template>
  <div>
    <q-item class="justify-center">
      Accounts represent a real world collection of money. You will probably
      only need the default ones.
    </q-item>
    <accountsTable flat/>
    <q-item v-if="l_add">
      <q-input label="Account Label" v-model="l_accountLabel" class="full-width" />
      <q-item-section side>
        <q-btn @click="l_createAccount" icon="send" dense color="positive" />
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { createAccount } from '../../../scripts/accounts.js'
import { defineAsyncComponent, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import {useRoute} from 'vue-router'

export default {
  name: 'createAccounts',
  setup(){
    const q = useQuasar()
    const route = useRoute()
    const l_accountLabel = ref('')
    const l_add = ref(false)
    function l_createAccount() {
      // console.log('creating account')
      createAccount(route.params.id, {
        label: l_accountLabel.value,
        type: 'account',
        systemAccount: false,
        inHeader: false,
      })
        .then(() => {
          l_add.value = false
          l_accountLabel.value = ''
        })
        .catch((err) => {
          console.error(err)
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Error creating account',
          })
        })
    }
    return { l_add, l_accountLabel, l_createAccount}
  },
  components: {
    'accountsTable': defineAsyncComponent(() =>
      import('../../accountsTable.vue')
    ),
  },
}
</script>
