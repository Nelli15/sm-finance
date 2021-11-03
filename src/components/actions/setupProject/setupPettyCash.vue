<template>
  <q-form @reset="onReset" @submit="onSubmit" ref="transForm">
    <q-list>
      <q-item class="justify-center">
        To begin tracking finances for your Summer Project, you will need to go
        to the bank with your Project cash card and withdraw a starting petty
        cash amount. Ask for a mixture of notes and coins so you are able to
        reimburse exact amounts. Ensure you withdrawn enough for all expenses
        until you will be able to withdraw more. To withdraw money for Petty
        Cash, use the Withdraw Petty Cash action in the actions menu.
      </q-item>
    </q-list>
  </q-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFirestore, setDoc, doc } from 'firebase/firestore'

export default {
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
      error: '',
    }
  },
  created() {
    let date = new Date()
    this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
  },
  methods: {
    onSubmit() {
      this.error = ''
      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      this.newTrans.submittedBy = this.user
      setDoc(
        doc(
          getFirestore(),
          `/projects/${this.project.id}/transactions/pettyOpen`
        ),
        this.newTrans
      )
        .then((res) => {
          // console.log('form submitted', res)
          this.$q.loading.hide()
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`,
          })
          this.$refs.transForm.reset()
          this.$emit('onSubmit', this.newTrans)
        })
        .catch((err) => {
          console.error(err)
          this.$q.loading.hide()
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
}
</script>
