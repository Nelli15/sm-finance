<template>
  <q-list>
    <q-item>
      <!-- <q-item-section> -->
      <q-firebase-uploader
        :metadata="{
          customMetadata: {
            projectId: project.id,
            transId: transRef.id,
            expiry: expiry(1),
          },
        }"
        color="secondary"
        flat
        bordered
        style="max-width: 500px"
        ref="transUpload"
        @uploaded="onUploaded"
        @failed="onFailed"
        @added="onAdded"
        @start="onStart"
        auto-upload
        hide-upload-btn
        accept=".jpg, image/*"
        dark
        :label="readOnly ? 'Receipt Submitted' : 'Upload Receipt Image'"
        :readonly="readOnly"
        :disabled="readOnly"
        class="q-mx-auto"
      />
      <!-- </q-item-section> -->
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
      <q-input
        v-if="newTrans.receipt"
        v-model="newTrans.GST"
        dense
        :label="'GST (' + this.project.currency + ')'"
        :rules="[
          (v) =>
            parseFloat(v) <= parseFloat(newTrans.amount) * 0.1 ||
            'GST must be <= 10% of amount',
          (v) => !!v || 'Required value',
        ]"
        style="width: 50%"
        prefix="$"
      />
    </q-item>
  </q-list>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore'
import { defineAsyncComponent } from 'vue'

export default {
  props: ['action'],
  data() {
    return {
      newTrans: {
        budget: 'debitCard',
        type: 'Bank Card',
        date: '',
        amount: '',
        GST: '0',
        receipt: false,
        desc: 'petty cash out - fee',
        category: 'Expense',
        reviewed: true,
        payTo: '',
      },
      transRef: {},
      readOnly: false,
      uploading: false,
    }
  },
  async created() {
    for (let trans in this.action.transactions) {
      if (this.action.transactions[trans].purpose === 'fee') {
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
    onAdded(files) {
      // console.log('file added', files)
      // files[0].name = 'blah.jpeg'
    },
    onStart(event) {
      // console.log('upload started', event)
      this.uploading = true
    },
    save() {
      if (
        process.env.PROD &&
        this.newTrans.receipt !== true &&
        parseFloat(this.newTrans.amount) > 10
      ) {
        return {
          error:
            'Please submit a receipt. If a Tax Invoice is not available, submit an eftpos receipt and set the GST to $0',
        }
      }
      this.newTrans.GST =
        this.newTrans.category === 'Expense' && this.newTrans.receipt === true
          ? this.newTrans.GST
          : 0

      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      if (this.newTrans.amount <= 0)
        return { error: 'Please enter a fee amount or skip the fee' }
      this.newTrans.submittedBy = this.user
      this.newTrans.action = this.action.id
      // console.log(this.newTrans)
      return setDoc(this.transRef, this.newTrans, { merge: true })
        .then((res) => {
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`,
          })
          // this.onReset()
          this.$emit('onSubmit', this.newTrans)
          // console.log(this.transRef)
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
        budget: 'debitCard',
        type: 'Bank Card',
        date: '',
        amount: '',
        GST: '0',
        receipt: false,
        desc: '‘petty cash out',
        category: 'Expense',
        reviewed: true,
        payTo: '',
      }
      this.transRef = doc(
        collection(getFirestore(), `/projects/${this.project.id}/transactions`)
      )
      this.readOnly = false
      let date = new Date()
      this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
      // console.log(this.$refs.transUpload)
      this.$refs.transUpload.reset()
    },
    onUploaded(event) {
      // console.log('file uploaded', event)
      this.readOnly = true
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Receipt Uploaded',
      })
      this.newTrans.receipt = true
      this.uploading = false
    },
    onFailed(event) {
      // console.log('file upload failed', event)
      this.$q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Upload Failed',
      })
      this.uploading = false
    },
    expiry(numDays) {
      var date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('budgets', ['accounts']),
    ...mapGetters('auth', ['user']),
  },
  watch: {
    async project() {
      for (let trans in this.action.transactions) {
        if (this.action.transactions[trans].purpose === 'fee') {
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
  components: {
    'q-firebase-uploader': defineAsyncComponent(() =>
      import('./../../q-firebase-uploader.vue')
    ),
  },
}
</script>
