<template>
  <div>
    <q-item class="justify-center">
      Categories provide a method for grouping budgets together for reporting to
      National Summer Missions. Only use the Categories provided by National
      Summer Missions.
    </q-item>
    <categoriesTable flat />
    <q-list v-if="l_add">
      <q-item>
        <q-input
          label="Category Label"
          v-model="l_accountLabel"
          class="full-width"
        />
      </q-item>
      <q-item>
        <q-btn
          label="Create"
          dense
          class="full-width"
          @click="l_createCategory"
          icon="send"
          color="positive"
        />
      </q-item>
    </q-list>
    <div class="or" v-if="l_add">OR</div>
    <div v-if="l_add" class="full-width">
      <div><sp-category-import /></div>
    </div>
  </div>
</template>

<script>
import { createAccount } from '../../../scripts/accounts.js'
import { defineAsyncComponent, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'createCategory',
  setup() {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    const l_accountLabel = ref('')
    const l_add = ref(false)
    const budgetCategories = computed(
      () => store.getters['budgets/budgetCategories']
    )
    function l_createCategory() {
      createAccount(route.params.id, {
        label: l_accountLabel.value,
        type: 'category',
        balance: 0,
        budget: 0,
        expenses: 0,
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
    return {
      l_accountLabel,
      l_add,
      budgetCategories,
      l_createCategory,
    }
  },
  components: {
    categoriesTable: defineAsyncComponent(() =>
      import('../../categoriesTable.vue')
    ),
    'sp-category-import': defineAsyncComponent(() =>
      import('../../sp-category-import.vue')
    ),
  },
}
</script>

<style scoped>
.or {
  position: relative;
  width: 100%;
  height: 40px;

  line-height: 40px;
  text-align: center;
}

.or::before,
.or::after {
  position: absolute;
  width: 40%;
  height: 1px;
  margin: 0 50px;
  top: 19px;

  background-color: #aaa;

  content: '';
}

.or::before {
  left: 0;
}

.or::after {
  right: 0;
}
</style>
