<template>
  <div>
    <q-item class="justify-center">
      Why do everything yourself when you can share the workload? Give others access to submit receipts as a Contributor or the entire Project as an Admin. In order to keep your Project secure allow as much access as is helpful while minimising access as much as possible.
    </q-item>
    <usersTable flat/>
    <div v-if="add">
      <div class="text-subtitle2">
        Invite People
        <q-icon
          name="help_outline"
          style="cursor: pointer"
          size="xs"
          color="grey-7"
        >
          <q-menu max-width="370px" anchor="center right" self="center left">
            <q-list separator class="q-px-sm">
              <q-item>
                <q-item-section>
                  <q-item-label header class="text-bold"
                    >Invite People</q-item-label
                  >
                  <q-item-label caption>
                    Invite people to access the Project. There are two levels of
                    permissions available.<br />
                    <br />
                    A good priniciple when considering the level of access to
                    grant is to only provide the minimum level of access
                    required to the minimum amount of people who need it. Avoid
                    giving Admin access to anyone who isn't a Finance Officer,
                    Project Director, or Summer Projects National.
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-expansion-item expand-separator label="Admins">
                <q-card>
                  <q-card-section>
                    Admins have access to view, edit, and delete all elements of
                    the Project.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Contributors">
                <q-card>
                  <q-card-section>
                    Contributors can only see the Transactions that they have
                    submitted and submit Transactions for the Budgets that they
                    have been given access to.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-menu>
        </q-icon>
      </div>
      <q-input
        v-model="newInvitation.email"
        type="email"
        label="Email"
        stack-label
      >
        <template v-slot:append>
          <q-select
            v-model="newInvitation.permission"
            placeholder="Permission"
            :options="['contributor', 'admin']"
            label="Permission"
            stack-label
            style="min-width: 100px"
          />
          <q-select
            stack-label
            v-if="newInvitation.permission === 'contributor'"
            :options="budgetOptionsFiltered"
            label="Budgets"
            style="min-width: 100px; max-width: 150px"
            v-model="newInvitation.budgets"
            emit-value
            map-options
            multiple
            use-chips
            option-value="id"
            options-dense
            color="primary"
            hide-bottom-space
            borderless
            hide-selected
            use-input
            @filter="budgetsFilterFn"
            input-debounce="0"
          />
        </template>
        <template v-slot:after>
          <q-btn
            dense
            title="Send Invitation"
            icon="send"
            color="positive"
            @click="l_addUser"
          />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import {
  addUser,
} from '../../../scripts/access.js'
import { defineAsyncComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'manageAccess',
  setup() {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    const add = ref(false)
    const newInvitation = ref({
      email: '',
      permission: 'contributor',
      accepted: false,
      sent: false,
      projectName: '',
      fromName: '',
      budgets: [],
    })
    const budgetOptionsFiltered = ref([])

    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])
    const invites = computed(() => store.getters['auth/invites'])
    const budgets = computed(() => store.getters['budgets/budgets'])
    const budgetOptions = computed(() => {
      return store.getters['budgets/budgetOptions'].filter(
        (val) => val.id !== 'debitCard' && val.id !== 'pettyCash'
      )
    })

    store.dispatch('auth/fetchContributors', route.params.id)

    store.dispatch('auth/fetchInvites', route.params.id)
    function l_addUser() {
      for (var key in invites.value) {
        if (
          newInvitation.value.email.toLowerCase() ===
          invites.value[key].email.toLowerCase()
        ) {
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Invite already sent',
          })
          return
        }
      }
      for (key in contributors.value) {
        if (
          newInvitation.value.email.toLowerCase() ===
          contributors.value[key].email.toLowerCase()
        ) {
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'User already has access',
          })
          return
        }
      }
      for (key in admins.value) {
        if (
          newInvitation.value.email.toLowerCase() ===
          admins.value[key].email.toLowerCase()
        ) {
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'User already has access',
          })
          return
        }
      }
      addUser(route.params.id, newInvitation.value)
        .then(() => {
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Added Successfully',
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

    function budgetsFilterFn(val, update) {
      if (val === '') {
        update(() => {
          budgetOptionsFiltered.value = budgetOptions.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        budgetOptionsFiltered.value = budgetOptions.value.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    }
    return {
      add,
      budgets,
      budgetOptions,
      budgetOptionsFiltered,
      budgetsFilterFn,
      l_addUser,
      newInvitation,
    }
  },
  components: {
    'usersTable': defineAsyncComponent(() =>
      import('../../usersTable.vue')
    ),
  },
}
</script>
