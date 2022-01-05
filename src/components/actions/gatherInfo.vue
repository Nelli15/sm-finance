<template>
  <div>
    {{header}}<br />
    <br />
    First we need some details from you.
    <q-list>
      <q-item>
        <q-input
          v-model="desc"
          label="What is this Cash for?"
          class="full-width"
        />
      </q-item>
      <q-item>
        <q-select
          v-model="action.responsiblePerson"
          label="Resonsible Person - Who are you giving the Cash to?"
          class="full-width"
          :options="usersFiltered"
          option-label="name"
          option-value="uid"
          map-options
          emit-value
          use-input
          @filter="usersFilterFn"
          :stack-label="!!action.responsiblePerson"
        >
          <template v-slot:selected>
            {{
              action.responsiblePerson &&
              users[action.responsiblePerson]
                ? `${users[action.responsiblePerson].name ? users[action.responsiblePerson].name:''} (${
                    users[action.responsiblePerson].email
                  })`
                : ''
            }}
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-avatar class="q-pr-md" size="md">
                  <q-img
                    :src="
                      scope.opt.photoURL
                        ? scope.opt.photoURL
                        : 'https://avatars.dicebear.com/api/bottts/' +
                          scope.opt.uid +
                          '.svg'
                    "
                    alt="Profile Picture"
                  >
                    <template v-slot:error>
                      <q-img
                        :src="
                          'https://avatars.dicebear.com/api/bottts/' +
                          scope.opt.uid +
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
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.email }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-item>
      <q-item>
        <q-select
          v-model="action.budget"
          label="Expense Budget"
          class="full-width"
          :options="budgetOptionsFiltered"
          option-label="label"
          option-value="id"
          map-options
          emit-value
          use-input
          @filter="budgetsFilterFn"
          input-debounce="0"
          :display-value="`${budgetOptions && action.budget && budgetOptions.find(val => val.id === action.budget).label || ''}`"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>
                  Budget Remaining: ${{
                      scope.opt.budget.subtract(scope.opt.expenses)
                  }}</q-item-label
                >
              </q-item-section>
              <q-item-section
                avatar
                v-if="
                  action.responsiblePerson &&
                  (users[action.responsiblePerson].permission ===
                    'admin' ||
                    users[action.responsiblePerson].budgets.includes(
                      scope.opt.id
                    ))
                "
              >
                <q-avatar class="q-pr-md" size="md">
                  <q-img
                    :src="
                      users[action.responsiblePerson].photoURL
                        ? users[action.responsiblePerson].photoURL
                        : 'https://avatars.dicebear.com/api/bottts/' +
                          action.responsiblePerson +
                          '.svg'
                    "
                    alt="Profile Picture"
                  >
                    <template v-slot:error>
                      <q-img
                        :src="
                          'https://avatars.dicebear.com/api/bottts/' +
                          action.responsiblePerson +
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
                <q-tooltip class="bg-cyan-2 text-black">
                  {{ users[action.responsiblePerson].name }}
                  has access to this budget</q-tooltip
                >
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { createAction, updateAction } from './../../scripts/actions.js'
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
export default {
  name: 'gatherInfo',
  props: ['action', 'header', 'prependDesc'],
  emits: ['actionChanged'],
  setup(props, { emit }) {
    const store = useStore()
    const route = useRoute()
    // variables
    const state = ref(false)
    const action = ref({
      responsiblePerson: '',
      budget: '',
      type: 'cashInHand',
      desc: '',
      date: '',
      transactions: {},
      complete: false,
      done: {
        1: false,
        2: false,
        3: false,
        4: false,
      },
    })
    const desc = ref('')
    const budgetOptionsFiltered = ref([])
    const usersFiltered = ref([])

    //on created
    if (props.action) {
      action.value = JSON.parse(JSON.stringify(props.action))
      let arr = action.value.desc.split('for ')
      arr.shift()
      desc.value = arr.join('for ')
    }
    if (!action.value.id) {
      let date = new Date()
      action.value.date = `${date
        .getDate()
        .toString()
        .padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    }
    async function save() {
      if (
        desc.value > '' &&
        action.value.responsiblePerson > '' &&
        action.value.budget > ''
      )
        action.value.done[1] = true
      else action.value.done[1] = false

      if (action.value.id) {
        updateAction(route.params.id, action.value.id, action.value)
        return emit('actionChanged', action.value)
      } else {
        action.value.id = await createAction(
          route.params.id,
          action.value
        )
        return emit('actionChanged', action.value)
      }
    }

    const project = computed(() => store.getters['projects/project'])
    const budgetOptions = computed(() => {
      // if (action.value.responsiblePerson) {
      //   let contBudgets = contributors.value.find(
      //     (val) => (val.uid = action.value.responsiblePerson)
      //   ).budgets
      //   return store.getters['budgets/budgetOptions'].filter(
      //     (val) => val.type !== 'account' && contBudgets.includes(val.id)
      //   )
      // } else {
      return store.getters['budgets/budgetOptions'].filter(
        (val) => val.type !== 'account'
      )
      // }
    })
    const users = computed(() => {
      let arr = [...store.getters['auth/admins'], ...store.getters['auth/contributors']]
      return arr.reduce(
        (obj, item) => ({
          ...obj,
          [item['uid']]: item,
        }),
        {}
      )
    })
    function updateDesc() {
      action.value.desc = `${props.prependDesc} to ${
        users.value[action.value.responsiblePerson]
          ? users.value[action.value.responsiblePerson].name ? users.value[action.value.responsiblePerson].name : users.value[action.value.responsiblePerson].email
          : '?'
      } for ${desc.value > '' ? desc.value : '?'}`
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
    function usersFilterFn(val, update) {
      if (val === '') {
        update(() => {
          usersFiltered.value = Object.values(users.value)
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        usersFiltered.value = Object.values(users.value).filter(
          (v) => v.name.toLowerCase().indexOf(needle) > -1
        )
      })
    }
    watch(desc, () => updateDesc())
    watch(action, () => updateDesc(), { deep: true })

    return {
      project,
      budgetOptions,
      budgetOptionsFiltered,
      budgetsFilterFn,
      usersFiltered,
      usersFilterFn,
      users,
      save,
      state,
      action,
      desc,
      header: props.header
    }
  },
}
</script>
