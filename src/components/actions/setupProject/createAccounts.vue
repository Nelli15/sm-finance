<template>
  <div>
    <q-item class="justify-center">
      Accounts represent a real world collection of money. You will probably
      only need the default ones.
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label class="text-h6"> Current Accounts </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>Label</q-item-section>
      <q-item-section side>Actions</q-item-section>
    </q-item>
    <q-scroll-area
      :style="`height: ${
        56 * Object.keys(accounts).length
      }px; max-height: 50vh;`"
    >
      <q-list>
        <q-item
          v-for="account in Object.values(accounts).sort((a, b) =>
            a.label > b.label ? 1 : -1
          )"
          :key="account.id"
        >
          <q-item-section class="cursor-pointer text-bold">
            {{ account.label }}
            <q-popup-edit v-model="account.label">
              <q-input
                :model-value="account.label > '' ? account.label : ''"
                @update:model-value="updateAccount(account.id, 'label', $event)"
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
          </q-item-section>

          <!-- <q-item-section key="awaitingReviews" >
            {{
              account.transAwaitingReview ? account.transAwaitingReview : ''
            }}
          </q-item-section> -->
          <span class="q-ml-auto">
            <q-toggle
              :model-value="account.inHeader"
              @update:model-value="
                updateAccount(account.id, 'inHeader', $event)
              "
              icon="view_compact"
            >
              <q-tooltip class="bg-accent text-black">View in Header</q-tooltip>
            </q-toggle>
            <!-- <q-btn :to="'budget/'+account.id" dense class="q-mr-sm">Budgets</q-btn> -->
            <q-btn :to="'transactions/' + account.id" dense class="q-mr-sm"
              >Transactions</q-btn
            >
            <q-btn
              v-if="account.inUse || account.systemAccount"
              dense
              color="red-3"
            >
              <q-icon name="delete_forever" />
              <q-tooltip class="bg-accent text-black"
                >Cannot Delete Budget while in use</q-tooltip
              >
            </q-btn>
            <sp-delete-btn
              dense
              v-else
              :docRef="`/projects/${project.id}/accounts/${account.id}`"
            />
          </span>
        </q-item>
      </q-list>
    </q-scroll-area>
    <!-- <div>
      <q-btn @click="add = !add" class="q-mx-auto">
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section>
          Add Account
        </q-item-section>
      </q-btn>
    </div> -->
    <q-item v-if="add">
      <q-input label="Account Label" v-model="account" class="full-width" />
      <q-item-section side>
        <q-btn @click="createAccount" icon="send" dense color="positive" />
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { createAccount } from '../../../scripts/accounts.js'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'createAccount',
  data() {
    return {
      account: '',
      add: false,
    }
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('budgets', ['accounts']),
  },
  methods: {
    ...mapActions('budgets', ['updateAccountByKey']),
    createAccount() {
      // console.log('creating account')
      createAccount(this.$route.params.id, {
        label: this.account,
        type: 'account',
        systemAccount: false,
        inHeader: false,
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
    updateAccount(accountId, key, val) {
      // console.log(budgetId, key, val)
      this.updateAccountByKey({ accountId, key, val })
      updateAccount(this.project.id, accountId, key, val)
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
  },
}
</script>
