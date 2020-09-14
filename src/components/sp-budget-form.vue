<template>
  <q-form @reset="onReset" @submit="onSubmit">
    <q-list style="min-width: 100px;min-height:360px;">
      <q-item class="text-h6 justify-center">
        Add
        {{ newBudget.type.charAt(0).toUpperCase() + newBudget.type.slice(1) }}

        <q-icon name="help_outline" size="xs" color="grey-7">
          <q-tooltip
            max-width="150px"
            anchor="center right"
            self="center left"
            content-class="bg-cyan-2 text-black"
          >
            Create a new
            {{
              newBudget.type.charAt(0).toUpperCase() + newBudget.type.slice(1)
            }}
            below.
          </q-tooltip>
        </q-icon>
      </q-item>
      <q-item>
        <q-btn-toggle
          v-model="newBudget.type"
          toggle-color="primary"
          :options="[
            { label: 'Budget', value: 'budget' },
            { label: 'Category', value: 'category' },
            { label: 'Account', value: 'account' }
          ]"
          style="width:100%"
          push
          dense
        />
      </q-item>
      <q-item>
        <q-input
          v-model="newBudget.label"
          :label="
            newBudget.type.charAt(0).toUpperCase() +
              newBudget.type.slice(1) +
              ' Label'
          "
          stack-label
          style="width:100%"
        />
      </q-item>
      <q-item v-if="newBudget.type === 'budget'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="
            newBudget.category > ''
              ? budgets[newBudget.category]
                ? budgets[newBudget.category].label
                : budgetCategories[newBudget.category].label
              : ''
          "
          dense
          label="Category"
          stack-label
          :options="budgetCategoryOptions"
          option-label="label"
          :option-value="item => (item === null ? null : item.id)"
          @input="newBudget.category = $event.id"
          style="width:100%"
        />
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-if="newBudget.type === 'budget'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-input
          v-model="newBudget.budget"
          dense
          :label="'Budget Amount (' + project.currency + ')'"
          stack-label
          type="number"
          style="width:100%"
          :rules="[val => !!val || 'Field is Required!']"
          prefix="$"
        />
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item class="absolute-bottom q-mb-sm">
        <q-btn label="Submit" type="submit" color="secondary" />
        <q-btn
          label="Clear"
          type="reset"
          color="secondary"
          flat
          class="q-ml-sm"
        />
      </q-item>
    </q-list>
  </q-form>
</template>

<script>
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/firestore')

export default {
  props: ['projectId'],
  data() {
    return {
      newBudget: {
        category: '', // ID
        type: 'budget', // ['budget', 'category', 'account']
        label: '', // name of budget or category
        budget: '' // the amount budgeted
      },
      loading: false
    }
  },
  created() {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
    // this.$q.loading.show()
  },
  methods: {
    onSubmit(event) {
      // this.loading = true
      this.$q.loading.show()
      if (this.newBudget.type === 'budget' && this.newBudget.category <= '') {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'Budget Category must not be blank'
        })
        this.$q.loading.hide()
        return false
      }
      // console.log(`/projects/${this.projectId}/budgets`)
      let newBudgetRef = firebase
        .firestore()
        .collection(`/projects/${this.projectId}/accounts`)
        .doc()
      // console.log(newBudgetRef)
      newBudgetRef
        .set(this.newBudget)
        .then(res => {
          this.$q.loading.hide()
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `${this.newBudget.type}: ${this.newBudget.label} Created Successfully`
          })
          this.$emit('onSubmit', this.newBudget)
        })
        .catch(err => {
          console.error(err)
          this.$q.loading.hide()
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
      // this.loading = false
    },
    onReset(event) {
      this.newBudget = {
        category: '', // ID
        type: 'budget', // ['budget', 'category', 'account']
        label: '', // name of budget or category
        budget: '' // the amount budgeted
      }
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'budgets',
      'budgetCategories',
      'budgetOptions',
      'budgetCategoryOptions'
    ])
  }
}
</script>
