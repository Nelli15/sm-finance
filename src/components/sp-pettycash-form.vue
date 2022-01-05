<template>
  <q-menu>
    <q-form @reset="onReset" @submit="onSubmit">
      <q-list style="min-width: 100px">
        <q-item>
          <!-- <q-item-section> -->
          Add Pettty Cash
          <!-- </q-item-section> -->
        </q-item>
        <q-item>
          <!-- <q-item-section> -->
          <!-- <q-popup-edit v-model="props.row.category"> -->
          <!-- <q-date v-model="newTrans.date" dense  /> -->
          <q-input
            v-model="newPetty.date"
            mask="date"
            label="Date"
            :rules="['date']"
            dense
            style="width: 100%"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="newPetty.date"
                    @update:model-value="() => $refs.qDateProxy.hide()"
                    mask="DD/MM/YYYY"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <!-- </q-popup-edit> -->
          <!-- </q-item-section> -->
        </q-item>
        <q-item>
          <q-btn label="Submit" type="submit" color="teal" />
          <q-btn label="Clear" type="reset" color="teal" flat class="q-ml-sm" />
        </q-item>
      </q-list>
    </q-form>
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: ['projectId'],
  data() {
    return {
      newPetty: {
        category: '', // Category of petty cash
        amountAUD: '', // $ amount updated to petty cash
        date: '', // date of petty cash transaction
        desc: '', // description
        number: '', // id
        type: '', // Type of petty transaction
      },
      loading: false,
    }
  },
  created() {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  methods: {
    onSubmit(event) {
      // this.loading = true
      // this.$q.loading.show()
      // console.log(`/projects/${this.projectId}/budgets`)
      // let newBudgetRef = firebase.firestore().collection(`/projects/${this.projectId}/budgets`).doc()
      // console.log(newBudgetRef)
      // newBudgetRef.set(this.newBudget).then(res => {
      //   this.$q.loading.hide()
      // }).catch(err => {
      //   console.log(err)
      //   this.$q.loading.hide()
      // })
      // this.loading = false
    },
  },
  computed: {
    ...mapGetters('budgets', ['budgets', 'budgetCategories', 'budgetOptions']),
  },
}
</script>
