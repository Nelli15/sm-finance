<template>
  <div>
    <q-item class="justify-center">
      At this point you no longer want contributors to submit new data. Revoke
      access to unrequired contributors.
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label class="text-h6"> Current Contributors </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>Email</q-item-section>
      <q-item-section>Status</q-item-section>
      <q-item-section side>Actions</q-item-section>
    </q-item>
    <q-scroll-area
      :style="`height: ${
        56 * Object.keys(allUsers).length
      }px; max-height: 50vh;`"
    >
      <q-list>
        <q-item
          v-for="user in allUsers"
          :key="user.uid"
          :class="user.invite && 'text-grey-6'"
          class="text-bold"
        >
          <q-item-section avatar v-if="user.invite">
            <q-avatar class="q-pr-md" size="md">
              <q-icon name="send" />
              <q-tooltip>Invite Sent</q-tooltip>
            </q-avatar>
          </q-item-section>
          <q-item-section avatar v-else>
            <q-avatar class="q-pr-md" size="md">
              <q-img
                :src="
                  user.photoURL
                    ? user.photoURL
                    : 'https://avatars.dicebear.com/api/bottts/' +
                      user.uid +
                      '.svg'
                "
                alt="Profile Picture"
              >
                <template v-slot:error>
                  <q-img
                    :src="
                      'https://avatars.dicebear.com/api/bottts/' +
                      user.uid +
                      '.svg'
                    "
                    alt="Profile Picture"
                  >
                    <template v-slot:error>
                      <div
                        class="
                          absolute-full
                          flex flex-center
                          bg-negative
                          text-white
                        "
                      >
                        Cannot load image
                      </div>
                    </template>
                  </q-img>
                </template>
              </q-img>
            </q-avatar>
          </q-item-section>
          {{ user.email }}
          <span class="q-mx-auto" style="width: 150px">
            {{ (user.permission === 'admin' && 'Admin') || '' }}
            <span v-if="user.permission === 'contributor'">
              <q-select
                label="Contributor Budget"
                :options="budgetOptionsFiltered"
                :model-value="user.budgets"
                @update:model-value="addBudget(event, user.uid)"
                multiple
                map-options
                emit-value
                options-value="id"
                borderless
                hide-dropdown-icon
                class="full-width"
              >
                <template v-slot:selected>
                  <q-chip
                    v-for="budget in user.budgets"
                    :key="budget"
                    dense
                    square
                    color="primary"
                    text-color="white"
                    class="q-my-none q-ml-xs q-mr-none"
                    removable
                    @remove="removeBudget(user, budget)"
                  >
                    {{ budgets[budget] && budgets[budget].label }}
                  </q-chip>
                </template>
              </q-select>
              <!-- {{
                user.budgets.length > 1
                  ? `| {user.budgets.length} budgets`
                  : `| {user.budgets.length} budget`
              }}
              <q-tooltip content-class="bg-accent text-black">
                <q-chip
                  dense
                  :label="budgets[budget].label"
                  v-for="budget in user.budgets"
                  :key="budget"
                />
              </q-tooltip> -->
            </span>
          </span>
          <span class="text-negative q-ml-auto">
            <q-btn
              :disabled="user.uid === currentUser.uid"
              dense
              icon="delete"
              color="negative"
              @click="deleteUser(user.uid)"
            />
          </span>
        </q-item>
      </q-list>
    </q-scroll-area>
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
          />
        </template>
        <template v-slot:after>
          <q-btn
            dense
            title="Send Invitation"
            icon="send"
            color="positive"
            @click="localAddUser"
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
  removeContributorBudget,
  updateInviteBudget,
  addContributorBudget,
  removeUser,
} from '../../../scripts/access.js'
import { arrayRemove } from 'firebase/firestore'
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

    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])
    const invites = computed(() => store.getters['auth/invites'])
    const budgetOptions = computed(() => store.getters['budgets/budgetOptions'])
    const budgets = computed(() => store.getters['budgets/budgets'])
    const currentUser = computed(() => store.getters['auth/user'])
    const budgetOptionsFiltered = computed(() => {
      return budgetOptions.value.filter(
        (val) => val.id !== 'debitCard' && val.id !== 'pettyCash'
      )
    })
    const allUsers = computed(() => {
      let users = [...admins.value, ...contributors.value]
      for (let invite of invites.value) {
        users.push({ invite: true, ...invite })
      }
      return users
    })

    store.dispatch('auth/fetchContributors', route.params.id)

    store.dispatch('auth/fetchInvites', route.params.id)
    function addBudget(tempBudgets, uid) {
      tempBudgets = tempBudgets.map((a) => a.id)
      // console.log(newInvitation.budgets.indexOf(event.id) !== -1)
      // let tempBudgets = JSON.parse(JSON.stringify(budgets))
      // if (tempBudgets.indexOf(newBudget) === -1) {
      //   tempBudgets.push(newBudget)
      addContributorBudget(route.params.id, tempBudgets, uid)
        .then(() => {
          // console.log('updated')
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Contributor Added Successfully',
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
      // }
    }
    function removeBudget(user, budget) {
      if (user.uid) {
        removeContributorBudget(route.params.id, arrayRemove(budget), user.uid)
          .then(() => {
            // console.log('updated')
            q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Budget Removed Successfully',
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
      } else {
        updateInviteBudget(route.params.id, arrayRemove(budget), user.email)
          .then(() => {
            // console.log('updated')
            q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Budget Removed Successfully',
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
    }
    function localAddUser(uid) {
      // console.log(`/projects/{route.params.id}/invites/{newInvitation.email}`)
      for (var key in invites) {
        if (
          newInvitation.email.toLowerCase() === invites[key].email.toLowerCase()
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
      for (key in contributors) {
        if (
          newInvitation.email.toLowerCase() ===
          contributors[key].email.toLowerCase()
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
      addUser(route.params.id, newInvitation)
        .then(() => {
          // console.log('updated')
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

    function deleteUser(uid) {
      // console.log(`/projects/${route.params.id}/contributors/${event}`)
      removeUser(route.params.id, uid)
        .then(() => {
          // console.log('updated')
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Removed Successfully',
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
    return {
      allUsers,
      add,
      budgets,
      budgetOptionsFiltered,
      localAddUser,
      removeBudget,
      addBudget,
      deleteUser,
      currentUser,
    }
  },
  components: {
    'sp-delete-btn': defineAsyncComponent(() =>
      import('../../sp-delete-btn.vue')
    ),
  },
}
</script>
