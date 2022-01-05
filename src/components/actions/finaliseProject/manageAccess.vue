<template>
  <div>
    <q-item class="justify-center">
      At this point you no longer want contributors to submit new data. Revoke
      access to unrequired contributors.
    </q-item>
    <usersTable flat/>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  name: 'manageAccess',
  setup() {
    return {

    }
  },
  components: {
    'usersTable': defineAsyncComponent(() =>
      import('../../usersTable.vue')
    ),
  },
}
</script>
