<template>
  <div>
    <q-form @reset="onReset" @submit="onSubmit" ref="transForm">
      <q-list>
        <q-item>
          Before the Project starts, National Summer Projects will transfer your
          total Project finances onto the cash card. You will receive an email
          letting you know how much was transferred and when. When you receive
          the transaction in your cash card, record the date (the date the money
          arrived in the account) amount below. This is your first income
          transaction, if you recieve any further income you can record it using
          a manual Income transaction.
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
      </q-list>
    </q-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore'

export default {
  name: 'firstTransaction',
  data() {
    return {
      newTrans: {
        budget: 'debitCard',
        type: 'Internet Transfer',
        date: '',
        amount: '',
        GST: 0,
        desc: 'Cash Card Load from SP',
        category: 'Income',
        reviewed: true,
      },
    }
  },
  async created() {
    let date = new Date()
    this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
    // console.log(this.transactions.find((o) => o.id === 'firstTrans'))
    if (this.transactions.find((o) => o.id === 'firstTrans')) {
      //   console.log('1')
      this.newTrans = this.transactions.find((o) => o.id === 'firstTrans')
    } else {
      let snap = await getDoc(
        doc(
          getFirestore(),
          `/projects/${this.project.id}/transactions/firstTrans`
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
    onSubmit() {
      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      // console.log('amount', this.newTrans.amount, !(this.newTrans.amount > 0))
      if (!(this.newTrans.amount > 0)) {
        return false
      } else {
        this.newTrans.submittedBy = this.user
        return setDoc(
          doc(
            getFirestore(),
            `/projects/${this.project.id}/transactions/firstTrans`
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
            return true
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
      }
    },
    onReset() {
      // console.log('form reset')
      this.newTrans = {
        budget: 'debitCard',
        type: 'Internet Transfer',
        date: '',
        amount: '',
        GST: 0,
        desc: 'Cash Card Load from SP',
        category: 'Income',
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
    ...mapGetters('budgets', ['accounts']),
    ...mapGetters('auth', ['user']),
    ...mapGetters('transactions', ['transactions']),
  },
}
</script>
