<template>
  <div>
    <q-list>
      <q-item>
        Take the remaining petty cash which should equal ${{
          remainingPettyCash
        }}, to a bank branch and deposit it onto the cash card. Ask for a
        receipt for this transaction. Record the date you deposited the cash
        along with the amount deposited below.
      </q-item>
      <q-item>
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
          v-if="!newTrans.receiptURL"
        />
        <q-img
          :src="newTrans.receiptURL"
          fit="contain"
          @click="open = !open"
          :style="open ? 'height:100%' : 'height:200px'"
          class="q-mx-auto"
          v-if="newTrans.receipt && newTrans.receiptURL"
        />
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
    </q-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'depositCash',
  data() {
    return {
      newTrans: {
        id: 'pettyClose',
        action: 'close',
        from: 'pettyCash',
        to: 'debitCard',
        type: 'Cash',
        date: '',
        amount: '',
        desc: '‘petty cash close',
        category: 'Journal',
        reviewed: true,
      },
      error: '',
      readOnly: false,
      uploading: false,
      open: false,
    }
  },
  async created() {
    this.transRef = doc(
      getFirestore(),
      `/projects/${this.project.id}/transactions/pettyClose`
    )
    let date = new Date()
    this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
    // console.log(this.transactions.find((o) => o.id === 'pettyClose'))
    if (this.transactions.find((o) => o.id === 'pettyClose')) {
      //   console.log('1')
      this.newTrans = this.transactions.find((o) => o.id === 'pettyClose')
    } else {
      let snap = await getDoc(this.transRef).catch((err) => {
        console.error(err)
      })
      if (snap.exists()) {
        this.newTrans = snap.data()
      }
    }
  },
  methods: {
    onAdded(files) {
      // console.log('file added', files)
      // files[0].name = 'blah.jpeg'
    },
    onStart(event) {
      // console.log('upload started', event)
      this.uploading = true
    },
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
          `/projects/${this.project.id}/transactions/pettyClose`
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
        from: 'pettyCash',
        to: 'debitCard',
        type: 'Cash',
        date: '',
        amount: '',
        desc: '‘petty cash close',
        category: 'Journal',
        reviewed: true,
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
    ...mapGetters('transactions', ['transactions']),
    remainingPettyCash() {
      return this.accounts.pettyCash.balance
    },
  },
  components: {
    'q-firebase-uploader': defineAsyncComponent(() =>
      import('./../../q-firebase-uploader.vue')
    ),
  },
}
</script>
