<template>
  <q-list>
    Record the details of the withdrawal below.<br />
    <!-- <q-item class="justify-center"> -->
    <ul>
      <li>Date - The date you withdrew the Petty Cash</li>
      <li>Amount - The amount you withdrew.</li>
    </ul>
    <!-- </q-item> -->
    <q-item>
      <!-- <q-item-section> -->
      <!-- <q-popup-edit v-model="props.row.category"> -->
      <!-- <q-date v-model="newTrans.date" dense  /> -->
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
  </q-list>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  getFirestore,
  setDoc,
  doc,
  addDoc,
  collection,
} from 'firebase/firestore'

export default {
  props: ['action'],
  data() {
    return {
      newTrans: {
        from: 'debitCard',
        to: 'pettyCash',
        type: 'Cash',
        date: '',
        amount: '',
        receipt: false,
        desc: 'petty cash out',
        category: 'Journal',
        reviewed: true,
      },
      transRef: {},
    }
  },
  async created() {
    for (let trans in this.action.transactions) {
      if (this.action.transactions[trans].purpose === 'withdrawal') {
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
    async save() {
      const ensureActionIsSet = (timeout) => {
        var start = Date.now()
        const wait = (resolve, reject) => {
          if (this.action.id) resolve(this.action.id)
          else if (timeout && Date.now() - start >= timeout)
            reject(new Error('timeout'))
          else setTimeout(wait.bind(this, resolve, reject), 30)
        }
        return new Promise(wait) // set the promise object within the ensureFooIsSet object
      }

      // This runs the promise code
      await ensureActionIsSet(2000)
      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      if (this.newTrans.amount <= 0)
        return { error: 'An amount is required to save the withdrawal' }
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
      this.newTrans = {
        from: 'debitCard',
        to: 'pettyCash',
        type: 'Cash',
        date: '',
        amount: '',
        receipt: false,
        desc: 'petty cash out',
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
  },
  watch: {
    async project() {
      for (let trans in this.action.transactions) {
        if (this.action.transactions[trans].purpose === 'withdrawal') {
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
      this.transRef = doc(
        collection(getFirestore(), `/projects/${this.project.id}/transactions`)
      )
    },
  },
}
</script>
