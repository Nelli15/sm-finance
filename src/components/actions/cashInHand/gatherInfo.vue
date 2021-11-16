<template>
  <div>
    A Cash in Hand action is used when you want to provide an individual with
    cash so they can purchase something, you should expect the receipt and
    remaining money returned.<br />
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
          v-model="localAction.responsiblePerson"
          label="Resonsible Person - Who are you giving the Cash to?"
          class="full-width"
          :options="usersFiltered"
          option-label="name"
          option-value="uid"
          map-options
          emit-value
          use-input
          @filter="usersFilterFn"
          :stack-label="!!localAction.responsiblePerson"
        >
          <template v-slot:selected>
            {{
              localAction.responsiblePerson &&
              users[localAction.responsiblePerson]
                ? `${users[localAction.responsiblePerson].name} (${
                    users[localAction.responsiblePerson].email
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
          v-model="localAction.budget"
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
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>
                  Budget Remaining: ${{
                    (
                      parseFloat(scope.opt.budget) -
                      parseFloat(scope.opt.expenses)
                    ).toFixed(2)
                  }}</q-item-label
                >
              </q-item-section>
              <q-item-section
                avatar
                v-if="
                  localAction.responsiblePerson &&
                  (users[localAction.responsiblePerson].permission ===
                    'admin' ||
                    users[localAction.responsiblePerson].budgets.includes(
                      scope.opt.id
                    ))
                "
              >
                <q-avatar class="q-pr-md" size="md">
                  <q-img
                    :src="
                      users[localAction.responsiblePerson].photoURL
                        ? users[localAction.responsiblePerson].photoURL
                        : 'https://avatars.dicebear.com/api/bottts/' +
                          localAction.responsiblePerson +
                          '.svg'
                    "
                    alt="Profile Picture"
                  >
                    <template v-slot:error>
                      <q-img
                        :src="
                          'https://avatars.dicebear.com/api/bottts/' +
                          localAction.responsiblePerson +
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
                  {{ users[localAction.responsiblePerson].name }}
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
import { createAction, updateAction } from './../../../scripts/actions.js'
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
export default {
  name: 'gatherInfo',
  props: ['action'],
  emits: ['actionChanged'],
  setup(props, { emit }) {
    const store = useStore()
    const route = useRoute()
    // variables
    const state = ref(false)
    const localAction = ref({
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
      localAction.value = JSON.parse(JSON.stringify(props.action))
      let arr = localAction.value.desc.split('for ')
      arr.shift()
      desc.value = arr.join('for ')
    }
    if (!localAction.value.id) {
      let date = new Date()
      localAction.value.date = `${date
        .getDate()
        .toString()
        .padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    }
    async function save() {
      if (
        desc.value > '' &&
        localAction.value.responsiblePerson > '' &&
        localAction.value.budget > ''
      )
        localAction.value.done[1] = true
      else localAction.value.done[1] = false

      if (localAction.value.id) {
        updateAction(route.params.id, localAction.value.id, localAction.value)
        return emit('actionChanged', localAction.value)
      } else {
        localAction.value.id = await createAction(
          route.params.id,
          localAction.value
        )
        return emit('actionChanged', localAction.value)
      }
    }

    const project = computed(() => store.getters['projects/project'])
    const budgetOptions = computed(() => {
      // if (localAction.value.responsiblePerson) {
      //   let contBudgets = contributors.value.find(
      //     (val) => (val.uid = localAction.value.responsiblePerson)
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
    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])
    const users = computed(() => {
      let arr = [...admins.value, ...contributors.value]
      return arr.reduce(
        (obj, item) => ({
          ...obj,
          [item['uid']]: item,
        }),
        {}
      )
    })
    function updateDesc() {
      localAction.value.desc = `Cash in Hand to ${
        users.value[localAction.value.responsiblePerson]
          ? users.value[localAction.value.responsiblePerson].name
          : '?'
      } for ${desc.value}`
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
          usersFiltered.value = [...admins.value, ...contributors.value]
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        usersFiltered.value = [...admins.value, ...contributors.value].filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    }
    watch(desc, () => updateDesc())
    watch(localAction, () => updateDesc(), { deep: true })

    return {
      project,
      budgetOptionsFiltered,
      budgetsFilterFn,
      usersFiltered,
      usersFilterFn,
      admins,
      contributors,
      users,
      save,
      state,
      localAction,
      desc,
    }
  },
}
</script>
