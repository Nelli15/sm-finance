<template>
  <div>
    <q-list>
      Record all the Expenses related to this Reimbursement below.
      <!-- </q-item> -->
      <transactions-table
        :transactions="transArray"
        :columnsProp="[
          'submittedBy',
          'date',
          'amount',
          'GST',
          'payTo',
          'desc',
          'actions',
        ]"
        @onTransUpdate="updateTrans"
        @deleted="$emit('deleted', $event)"
      />
      <q-form @reset="onReset" @submit="onSubmit" ref="transForm" v-if="add">
        <q-list
          style="min-width: 100px; max-width: 500px"
          :style="$q.platform.is.desktop ? 'width:400px;' : ''"
          class="q-mx-auto"
        >
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
            />
            <q-icon
              name="help_outline"
              style="cursor: pointer"
              size="xs"
              color="grey-7"
              class="q-ml-md"
            >
              <q-menu
                max-width="370px"
                anchor="center right"
                self="center left"
              >
                <q-list separator class="q-px-sm">
                  <q-expansion-item
                    expand-separator
                    label="Upload Receipt Image"
                  >
                    <q-card>
                      <q-card-section>
                        Upload a photo of your receipt using the + button.<br />
                        The receipt must include the words 'Tax Invoice' or 'Tax
                        Receipt' and have the GST to be a legal Tax receipt.
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                  <q-expansion-item expand-separator label="Date">
                    <q-card>
                      <q-card-section>
                        The date the transaction was made, usually as recorded
                        on the receipt.
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                  <q-expansion-item expand-separator label="Business">
                    <q-card>
                      <q-card-section>
                        The name of the Business or Supplier who the purchase
                        was made from.
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                  <q-expansion-item expand-separator label="Amount">
                    <q-card>
                      <q-card-section>
                        The amount that was transferred.
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                  <q-expansion-item expand-separator label="GST">
                    <q-card>
                      <q-card-section>
                        The amount of GST that was paid. Only fill this in if
                        you have submitted a Tax Invoice. In all other cases
                        leave as $0
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                  <q-expansion-item expand-separator label="Description">
                    <q-card>
                      <q-card-section>
                        A short 1 sentence description for the transaction, why
                        did you make this transaction.<br />
                        Some Examples include:<br />
                        <ul>
                          <li>food for celebration dinner</li>
                          <li>groceries for welcome bbq</li>
                          <li>reimbursement for …</li>
                        </ul>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                  <q-expansion-item expand-separator label="Submit">
                    <q-card>
                      <q-card-section> Submit the Transaction </q-card-section>
                    </q-card>
                  </q-expansion-item>
                  <q-expansion-item expand-separator label="Clear">
                    <q-card>
                      <q-card-section>
                        Clear all fields of this Transaction
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </q-list>
              </q-menu>
            </q-icon>
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

          <q-item v-if="newTrans.category !== 'Journal'">
            <q-input
              v-model="newTrans.payTo"
              dense
              label="Business"
              style="width: 100%"
              :rules="[(v) => v > '' || 'Required']"
            />
          </q-item>
          <q-item v-if="newTrans.type === 'Cheque'">
            <!-- <q-item-section> -->
            <!-- <q-popup-edit v-model="props.row.category"> -->
            <q-input
              v-model="newTrans.cheque"
              dense
              label="Cheque #"
              style="width: 100%"
              :rules="[(v) => !!v || 'Required value']"
            />
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
              v-if="newTrans.category === 'Expense' && newTrans.receipt"
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
          <q-item>
            <q-input
              v-model="newTrans.desc"
              dense
              label="Description"
              style="width: 100%"
              :rules="[(v) => v > '' || 'Description Required']"
            />
          </q-item>
          <q-item>
            <q-btn
              label="Submit"
              type="submit"
              color="secondary"
              :disable="uploading"
            />
            <q-btn
              label="Clear"
              type="reset"
              color="secondary"
              flat
              class="q-ml-sm"
              :disable="uploading"
            />
          </q-item>
        </q-list>
      </q-form>
      <!-- <q-item>
        <q-input
          v-model="newTrans.date"
          mask="##/##/####"
          label="Date"
          :rules="[
            v =>
              /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(
                v
              ) || 'Not a Date'
          ]"
          dense
          style="width:100%"
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
      </q-item>
      <q-item>
        <q-input
          v-model="newTrans.amount"
          dense
          :label="'Amount (' + this.project.currency + ')'"
          :rules="[v => !!v || 'Required value']"
          :style="newTrans.receipt ? 'width:50%;' : 'width: 100%;'"
          prefix="$"
        />
      </q-item>
      <q-item v-if="error > ''" class="text-red">
        {{ error }}
      </q-item> -->
    </q-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore'
import { defineAsyncComponent } from 'vue'
import { updateTransactionByKey } from '../../../scripts/transactions.js'

export default {
  props: ['action', 'transactions'],
  data() {
    return {
      add: false,
      newTrans: {
        budget: '',
        type: 'Cash',
        date: '',
        amount: '',
        receipt: false,
        desc: '',
        category: 'Expense',
        reviewed: false,
      },
      transRef: {},
      readOnly: false,
      uploading: false,
    }
  },
  created() {
    // let transaction = {}
    let date = new Date()
    this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
    this.newTrans.budget = this.action.budget
    this.transRef = doc(
      collection(getFirestore(), `/projects/${this.project.id}/transactions`)
    )
    this.newTrans.action = this.action.id
  },
  methods: {
    updateTrans({ trans, key, val }) {
      console.log(trans, key, val)
      if (
        key === 'GST' &&
        parseFloat(val) > parseFloat(this.transactions[trans].amount) * 0.1
      ) {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'GST must be <= Amount',
        })
        return
      }

      // this.updateTransactionByKey({ trans, key, val })
      this.$emit('onTransUpdate', { trans, key, val })
      updateTransactionByKey(this.project.id, trans, key, val)
        .then(() => {
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Transaction: Updated Successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    },
    onAdded(files) {},
    onStart(event) {
      this.uploading = true
    },
    onSubmit() {
      this.$q.loading.show()
      this.newTrans.id =
        this.transRef._key.path.segments[this.transRef._key.path.length - 1]
      this.newTrans.cheque =
        this.newTrans.type === 'Cheque' ? this.newTrans.cheque : ''
      this.newTrans.GST = this.newTrans.receipt === true ? this.newTrans.GST : 0
      this.newTrans.budget = this.newTrans.budget
      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      this.newTrans.amount =
        this.newTrans.type === 'Cash'
          ? round5(this.newTrans.amount)
          : this.newTrans.amount
      this.newTrans.submittedBy = this.user
      console.log(this.newTrans, this.transRef)
      setDoc(this.transRef, this.newTrans)
        .then((res) => {
          this.$emit('onSubmit', this.newTrans)
          this.$q.loading.hide()
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`,
          })
          this.$refs.transForm.reset()
        })
        .catch((err) => {
          console.error('Oops', err)
          this.$q.loading.hide()
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
      // this.$refs.transUpload.upload()
      // this.$store.dispatch('updateTransactions', this.newTrans)
      // this.onReset()
      function round5(x) {
        var mod = (x - Math.floor(x)) * 100
        if (mod % 5 > 0) {
          mod % 5 <= 2 ? (mod = mod - (mod % 5)) : (mod = mod + (5 - (mod % 5)))
          return parseFloat(Math.floor(x) + mod / 100)
        } else {
          return parseFloat(x)
        }
      }
    },
    onReset() {
      this.newTrans = {
        budget: '',
        type: 'Cash',
        date: '',
        amount: '',
        receipt: false,
        desc: '',
        category: 'Expense',
        reviewed: false,
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
      this.$refs.transUpload.reset()
    },
    onUploaded(event) {
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
    // save() {
    //   this.newTrans.amount =
    //     typeof this.newTrans.amount === 'string'
    //       ? this.newTrans.amount.replace(',', '')
    //       : this.newTrans.amount
    //   this.newTrans.submittedBy = this.user
    //   this.newTrans.action = this.action.id
    //   return setDoc(
    //     doc(getFirestore(), `/projects/${this.project.id}/transactions/`),
    //     this.newTrans
    //   )
    //     .then((res) => {
    //       // console.log('form submitted', res)
    //       this.$q.loading.hide()
    //       this.$q.notify({
    //         color: 'positive',
    //         textColor: 'white',
    //         icon: 'cloud_done',
    //         message: `Transaction: Submitted Successfully`,
    //       })
    //       this.$refs.transForm.reset()
    //       this.$emit('onSubmit', this.newTrans)
    //     })
    //     .catch((err) => {
    //       console.error(err)
    //       this.$q.loading.hide()
    //       this.$q.notify({
    //         color: 'negative',
    //         textColor: 'white',
    //         icon: 'error',
    //         message: 'Oops, Something went wrong!',
    //       })
    //     })
    // },
    // onReset() {
    //   // console.log('form reset')
    //   this.newTrans = {
    //     budget: this.action.budget,
    //     type: 'Cash',
    //     date: '',
    //     amount: '',
    //     receipt: false,
    //     desc: `Cash Advance for ${this.action.name}`,
    //     category: 'Expense',
    //     reviewed: false,
    //   }
    //   let date = new Date()
    //   this.newTrans.date = `${date.getDate().toString().padStart(2, '0')}/${(
    //     date.getMonth() + 1
    //   )
    //     .toString()
    //     .padStart(2, '0')}/${date.getFullYear()}`
    // },
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('auth', ['user']),
    transArray() {
      let trans = Object.values(this.transactions)
      return trans.filter((val) => {
        return val.category === 'Expense'
      })
    },
  },
  components: {
    'transactions-table': defineAsyncComponent(() =>
      import('./../../transactionsTable.vue')
    ),
    'q-firebase-uploader': defineAsyncComponent(() =>
      import('./../../q-firebase-uploader.vue')
    ),
  },
}
</script>
