<template>
  <div>
    Give the expected cash to
    {{ responsiblePerson ? responsiblePerson.name : 'the Responsible Person' }}
    and record the details below.
    <q-list>
      <q-item>
        <q-item-label caption v-if="action.budget && budgets[action.budget]">
          Budget Remaining: ${{
            (
              parseFloat(budgets[action.budget].budget) -
              parseFloat(budgets[action.budget].expenses)
            ).toFixed(2)
          }}</q-item-label
        >
      </q-item>
      <q-item>
        <q-input
          v-model="newTrans.date"
          mask="##/##/####"
          label="Date"
          :rules="[
            (v) =>
              /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(
                v
              ) || 'Not a Date',
          ]"
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
                  v-model="newTrans.date"
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
        <q-input
          v-model="newTrans.amount"
          dense
          :label="'Amount (' + this.project.currency + ')'"
          :rules="[(v) => !!v || 'Required value']"
          :style="newTrans.receipt ? 'width:50%;' : 'width: 100%;'"
          prefix="$"
        />
      </q-item>
      <q-item v-if="error > ''" class="text-red">
        {{ error }}
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore'

export default {
  name: 'giveCash',
  props: ['action', 'responsiblePerson'],
  data() {
    return {
      newTrans: {
        to: '',
        from: 'pettyCash',
        type: 'Cash',
        date: '',
        amount: '',
        GST: 0,
        desc: 'Cash In Hand',
        category: 'Journal',
        reviewed: true,
      },
      error: '',
    }
  },
  async created() {
    if (this.action && this.action.transactions) {
      for (let trans in this.action.transactions) {
        if (this.action.transactions[trans].purpose === 'cash-in-hand') {
          this.transRef = doc(
            getFirestore(),
            `/projects/${this.project.id}/transactions/${trans}`
          )
          this.newTrans = await this.fetchTransById({
            projectId: this.$route.params.id,
            id: trans,
          })
          return
        }
      }
    }
    this.newTrans.desc = this.action.desc
    this.newTrans.to = this.action.budget
    this.transRef = doc(
      collection(getFirestore(), `/projects/${this.project.id}/transactions`)
    )
    let date = new Date()
    this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
  },
  methods: {
    ...mapActions('transactions', ['fetchTransById']),
    save() {
      this.error = ''
      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      this.newTrans.submittedBy = this.user
      this.newTrans.action = this.action.id
      // console.log(this.newTrans)
      return setDoc(this.transRef, this.newTrans)
        .then((res) => {
          // console.log('form submitted', res)
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`,
          })
          // this.onReset()
          this.$emit('onSubmit', this.newTrans)
          return this.transRef.id
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    },
    onReset() {
      // console.log('form reset')
      this.newTrans = {
        to: '',
        from: 'pettyCash',
        type: 'Cash',
        date: '',
        amount: '',
        GST: 0,
        desc: 'Cash In Hand',
        category: 'Journal',
        reviewed: true,
      }
      let date = new Date()
      this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('auth', ['user']),
    ...mapGetters('budgets', ['budgets']),
  },
  watch: {
    async project() {
      // if (this.action && this.action.transactions) {
      //   for (let trans in this.action.transactions) {
      //     if (this.action.transactions[trans].purpose === 'withdrawal') {
      //       this.transRef = doc(
      //         getFirestore(),
      //         `/projects/${this.project.id}/transactions/${trans}`
      //       )
      //       this.newTrans = await this.fetchTransById({
      //         projectId: this.$route.params.id,
      //         id: trans,
      //       })
      //       return
      //     }
      //   }
      // }
      this.transRef = doc(
        collection(getFirestore(), `/projects/${this.project.id}/transactions`)
      )
    },
  },
}
</script>
