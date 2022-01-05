<template>
    <q-table
      :columns="[{name: 'avatar', label: ''},{name: 'email', label: 'Email', align: 'left', sortable:true, field: 'name'}, {name: 'permissions', label: 'Permissions', style: 'min-width: 105px', align: 'left', sortable:true, field: 'permission'}, {name: 'actions', label:'Actions', align: 'right'}]"
      :rows="allUsers"
      row-key="uid"
      binary-state-sort
      title="Contributors"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="avatar" :props="props">
            <q-item-section avatar v-if="props.row.invite">
            <q-avatar class="q-pr-md" size="md">
              <q-icon name="send" />
              <q-tooltip>Invite Sent</q-tooltip>
            </q-avatar>
          </q-item-section>
          <q-item-section avatar v-else>
            <q-avatar class="q-pr-md" size="md">
              <q-img
                :src="
                  props.row.photoURL
                    ? props.row.photoURL
                    : 'https://avatars.dicebear.com/api/bottts/' +
                      props.row.uid +
                      '.svg'
                "
                alt="Profile Picture"
              >
                <template v-slot:error>
                  <q-img
                    :src="
                      'https://avatars.dicebear.com/api/bottts/' +
                      props.row.uid +
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
          </q-td>
          <q-td key="email" :props="props">
            {{ props.row.name }}<br>
            ({{ props.row.email }})
            <q-popup-edit v-model="props.row.name">
              <q-input v-model="props.row.name" dense autofocus label="User Name" @update:model-value="l_updateUser({val: $event, user: props.row, key: 'name'})" debounce="3000"/>
            </q-popup-edit>
          </q-td>
          <q-td key="permissions" :props="props" style="min-width: 150px">
            <q-select
            v-model="props.row.permission"
            @update:model-value="l_updateUser({val: $event, user: props.row, key: 'permission'})"
            placeholder="Permission"
            :options="['contributor', 'admin']"
            style="min-width: 100px"
            :style="props.row.permission === 'admin' ? 'width:100%' : 'width:50%'"
            borderless
            hide-dropdown-icon
            dense
          >
          <template v-slot:selected>
            {{props.row.permission[0].toUpperCase() + props.row.permission.substring(1)}}
          </template>
        </q-select>
              <q-select
              v-if="props.row.permission === 'contributor'" style="width:50%"
                label="Contributor Budgets"
                :options="budgetOptions"
                :model-value="props.row.budgets"
                @update:model-value="l_addBudget($event, props.row)"
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
                    v-for="budget in props.row.budgets"
                    :key="budget"
                    dense
                    square
                    color="primary"
                    text-color="white"
                    class="q-my-none q-ml-xs q-mr-none"
                    removable
                    @remove="l_removeBudget(props.row, budget)"
                  >
                    {{ budgets[budget] && budgets[budget].label }}
                  </q-chip>
                </template>
              </q-select>
          </q-td>
          <q-td key="actions" :props="props">
           <span class="text-negative q-ml-auto">
            <q-btn
              :disabled="props.row.uid === currentUser.uid"
              dense
              icon="delete"
              color="negative"
              @click="l_deleteUser(props.row.uid)"
            />
          </span>
          </q-td>
        </q-tr>
      </template>
    </q-table>
</template>

<script>
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import {
  removeContributorBudget,
  updateInviteBudget,
  updateUser,
  updateInvite,
  addContributorBudget,
  removeUser,
} from '/src/scripts/access.js'
import { arrayRemove } from 'firebase/firestore'
import { defineAsyncComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'manageAccess',
  setup() {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()
    const budgetOptionsFiltered = ref([])

    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])
    const invites = computed(() => store.getters['auth/invites'])
    const budgets = computed(() => store.getters['budgets/budgets'])
    const currentUser = computed(() => store.getters['auth/user'])
    const budgetOptions = computed(() => {
      return store.getters['budgets/budgetOptions'].filter(
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
    function l_addBudget(tempBudgets, user) {
      tempBudgets = tempBudgets.map((a) => a.id)
      if (user.uid) {
      addContributorBudget(route.params.id, tempBudgets, user.uid)
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
      } else {
        updateInviteBudget(route.params.id, tempBudgets, user.email)
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
      }

    }
    function l_removeBudget(user, budget) {
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
    function l_updateUser({ user, key, val}) {
      if(user.uid) {
      updateUser({projectId: route.params.id, uid: user.uid, key, val})
        .then(() => {
          // console.log('updated')
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Updated Successfully',
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
        updateInvite({projectId: route.params.id, email: user.email, key, val})
        .then(() => {
          // console.log('updated')
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Updated Successfully',
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
    function l_deleteUser(uid) {
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
      allUsers,
      budgets,
      budgetOptions,
      budgetOptionsFiltered,
      budgetsFilterFn,
      l_removeBudget,
      l_addBudget,
      l_deleteUser,
      l_updateUser,
      currentUser,
    }
  },
  components: {
    'sp-delete-btn': defineAsyncComponent(() =>
      import('./sp-delete-btn.vue')
    ),
  },
}
</script>
