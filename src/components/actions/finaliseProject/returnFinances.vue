<template>
  <div>
    <q-item class="justify-center">
      Transfer the remaining finances, which should equal ${{
        remainingBalance
      }}, to National Summer Projects bank account in one transaction.<br />Name:
      Summer Projects<br />BSB: 064433<br />Account Number: 10577799<br />Reference:
      {{ project.number ? project.number : '*Project Code*' }} Balance
    </q-item>
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
    <q-item v-if="error > ''" class="text-red">
      {{ error }}
    </q-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore'

export default {
  name: 'retrnFinances',
  data() {
    return {
      newTrans: {
        action: 'close',
        id: 'lastTrans',
        budget: 'debitCard',
        type: 'Internet Transfer',
        date: '',
        amount: '',
        GST: 0,
        desc: 'Project close',
        category: 'Expense',
        reviewed: true,
        payTo: 'National Summer Projects',
      },
      error: '',
    }
  },
  async created() {
    let date = new Date()
    this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
    // console.log(this.transactions.find((o) => o.id === 'lastTrans'))
    if (this.transactions.find((o) => o.id === 'lastTrans')) {
      //   console.log('1')
      this.newTrans = this.transactions.find((o) => o.id === 'lastTrans')
    } else {
      let snap = await getDoc(
        doc(
          getFirestore(),
          `/projects/${this.project.id}/transactions/lastTrans`
        )
      ).catch((err) => {
        console.error(err)
      })
      if (snap.exists()) {
        this.newTrans = snap.data()
      }
    }
  },
  methods: {
    save() {
      this.error = ''
      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      this.newTrans.submittedBy = this.user
      return setDoc(
        doc(
          getFirestore(),
          `/projects/${this.project.id}/transactions/lastTrans`
        ),
        this.newTrans
      )
        .then((res) => {
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`,
          })
          this.$emit('onSubmit', this.newTrans)
          return this.newTrans.id
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
        action: 'close',
        id: 'lastTrans',
        budget: 'debitCard',
        type: 'Internet Transfer',
        date: '',
        amount: '',
        GST: 0,
        desc: 'Project close',
        category: 'Expense',
        reviewed: true,
        payTo: 'National Summer Projects',
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
    ...mapGetters('budgets', ['accounts']),
    ...mapGetters('auth', ['user']),
    ...mapGetters('transactions', ['transactions']),
    remainingBalance() {
      return this.accounts.debitCard.balance
    },
  },
}
</script>
