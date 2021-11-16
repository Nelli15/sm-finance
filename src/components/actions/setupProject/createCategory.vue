<template>
  <div>
    <q-item class="justify-center">
      Categories provide a method for grouping budgets together for reporting to
      National Summer Projects. Only use the Categories provided by National
      Summer Projects.
    </q-item>
    <q-item v-if="Object.keys(budgetCategories).length > 0">
      <q-item-section>
        <q-item-label class="text-h6"> Current Categories </q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="Object.keys(budgetCategories).length > 0">
      <q-item-section avatar>Budget</q-item-section>
      <q-item-section>Label</q-item-section>
      <q-item-section side>Actions</q-item-section>
    </q-item>
    <q-scroll-area
      :style="`height: ${
        56 * Object.keys(budgetCategories).length
      }px; max-height: 50vh;`"
    >
      <q-list>
        <q-item
          v-for="account in Object.values(budgetCategories).sort((a, b) =>
            a.label > b.label ? 1 : -1
          )"
          :key="account.id"
        >
          <q-item-section avatar>
            <q-badge
              :class="{
                'bg-green-8': (account.budget ? account.budget : 0) > 0,
                'bg-red-8': (account.budget ? account.budget : 0) < 0,
                'bg-black': (account.budget ? account.budget : 0) == 0,
              }"
              :label="'$' + (account.budget ? account.budget : 0).toFixed(2)"
            />
          </q-item-section>
          <q-item-section key="label" class="cursor-pointer text-bold">
            {{ account.label }}
            <q-popup-edit v-model="account.label">
              <q-input
                :model-value="account.label > '' ? account.label : ''"
                @update:model-value="
                  updateCategory(account.id, 'label', $event)
                "
                dense
                autofocus
                label="Budget Label"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              class="bg-accent text-black"
            >
              <q-icon name="edit" />Edit
            </q-tooltip>
            <q-badge
              v-if="account.transAwaitingReview > 0"
              class="bg-red-8"
              :label="
                account.transAwaitingReview ? account.transAwaitingReview : ''
              "
              floating
            />
          </q-item-section>

          <!-- <q-item-section key="awaitingReviews" >
            {{
              account.transAwaitingReview ? account.transAwaitingReview : ''
            }}
          </q-item-section> -->
          <span class="q-ml-auto">
            <q-btn :to="'budget/' + account.id" dense class="q-mr-sm"
              >Budgets</q-btn
            >
            <q-btn :to="'transactions/' + account.id" dense class="q-mr-sm"
              >Transactions</q-btn
            >
            <q-btn v-if="account.inUse" dense color="negative">
              <q-icon name="delete_forever" />
              <q-tooltip class="bg-accent text-black"
                >Cannot Delete Budget while in use</q-tooltip
              >
            </q-btn>
            <sp-delete-btn
              dense
              v-if="!account.inUse"
              :docRef="`/projects/${project.id}/accounts/${account.id}`"
            />
          </span>
        </q-item>
      </q-list>
    </q-scroll-area>
    <q-list v-if="add">
      <q-item>
        <q-input label="Category Label" v-model="account" class="full-width" />
      </q-item>
      <q-item>
        <q-btn
          label="Create"
          dense
          class="full-width"
          @click="createCategory"
          icon="send"
          color="positive"
        />
      </q-item>
    </q-list>
    <div class="or" v-if="add">OR</div>
    <div v-if="add" class="full-width">
      <div><sp-category-import /></div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { createAccount } from '../../../scripts/accounts.js'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'createCategory',
  data() {
    return {
      account: '',
      add: false,
    }
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('budgets', ['budgetCategories']),
  },
  methods: {
    ...mapActions('budgets', ['updateCategoryByKey']),
    createCategory() {
      createAccount(this.$route.params.id, {
        label: this.account,
        type: 'category',
        balance: 0,
        budget: 0,
        expenses: 0,
      })
        .then(() => {
          this.add = false
          this.account = ''
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Error creating account',
          })
        })
    },
    updateCategory(accountId, key, val) {
      // console.log(budgetId, key, val)
      this.updateCategoryByKey({ accountId, key, val })
      updateCategory(this.project.id, accountId, key, val)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Account: Updated Successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    },
  },
  components: {
    'sp-delete-btn': defineAsyncComponent(() =>
      import('../../sp-delete-btn.vue')
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
