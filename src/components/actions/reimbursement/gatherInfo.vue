<template>
  <div>
    First we need some details from you.
    <q-list>
      <q-item>
        <q-input
          v-model="desc"
          label="What is this Cash for?"
          class="full-width"
        />
      </q-item>
      <!-- <q-item>
        <q-select
          v-model="localAction.responsiblePerson"
          label="Resonsible Person - Who are you giving the Cash to?"
          class="full-width"
          :options="[...admins, ...contributors]"
          option-label="name"
          option-value="uid"
          map-options
          emit-value
        />
      </q-item> -->
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
        />
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
      budget: '',
      type: 'reimbursement',
      desc: '',
      date: '',
      transactions: {},
      complete: false,
      done: {
        1: false,
        2: false,
        3: false,
      },
    })
    const desc = ref('')
    const budgetOptionsFiltered = ref([])

    //on created
    if (props.action) {
      localAction.value = JSON.parse(JSON.stringify(props.action))
      desc.value =
        localAction.value.desc.split('for ')[
          localAction.value.desc.split('for ').length - 1
        ]
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
      if (desc.value > '' && localAction.value.budget > '')
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
    const budgetOptions = computed(() =>
      store.getters['budgets/budgetOptions'].filter(
        (val) => val.type !== 'account'
      )
    )
    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])

    function updateDesc() {
      localAction.value.desc = `Reimbursement for ${desc.value}`
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
    watch(desc, () => updateDesc())
    watch(localAction, () => updateDesc(), { deep: true })

    return {
      project,
      budgetOptionsFiltered,
      budgetsFilterFn,
      admins,
      contributors,
      save,
      state,
      localAction,
      desc,
    }
  },
}
</script>
