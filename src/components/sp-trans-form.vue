<template>
  <q-form @reset="onReset" @submit="onSubmit" ref="transForm">
    <q-list
      style="min-width: 100px; max-width:500px;"
      :style="$q.platform.is.desktop ? 'width:400px;' : ''"
    >
      <q-item class="text-h6 justify-center">
        <!-- <q-item-section> -->
        Add Transaction
        <q-icon
          name="help_outline"
          style="cursor:pointer;"
          size="xs"
          color="grey-7"
        >
          <q-menu max-width="370px" anchor="center right" self="center left">
            <q-list separator class="q-px-sm">
              <q-item>
                <q-item-section>
                  <q-item-label header class="text-bold"
                    >Add Transaction</q-item-label
                  >
                  <q-item-label caption>
                    This form is used to submit a new Transaction/Receipt
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-expansion-item
                expand-separator
                label="Category"
                v-if="isAdmin"
              >
                <q-card>
                  <q-card-section>
                    The type of transaction<br />
                    <b>Income</b> - Money that is coming into the project. This
                    is extra money that you did not have at the start of your
                    project. (This does not include money moving around within
                    your Project)<br />
                    <b>Expense</b> - Money that is leaving your project. This is
                    any money that is being spent by anyone on the project.
                    (This does not include money moving around within your
                    Project)<br />
                    <b>Journal</b> - Money that is being moved around within
                    your Project.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Type" v-if="isAdmin">
                <q-card>
                  <q-card-section>
                    The physical way in which the funds left the project, ie. if
                    someone paid for groceries using their credit card and then
                    was given cash as reimbursement by the finance officer,
                    record Cash.<br />
                    <b>Cash</b> - The transaction was paid for in Cash<br />
                    <b>Bank Card</b> - The transaction was paid via a Bank
                    Card<br />
                    <b>Internet Transfer</b> - The transaction was paid via
                    Internet Bank Transfer<br />
                    <b>Cheque</b> - The transaction was paid for via Cheque.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Upload Receipt Image">
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
                    The date the transaction was made, usually as recorded on
                    the receipt.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Budget">
                <q-card>
                  <q-card-section>
                    The budget the transaction is associated with.<br />
                    If you are not sure, or don't have access to the associated
                    budget, please speak to your finance officer.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Business">
                <q-card>
                  <q-card-section>
                    The name of the Business or Supplier who the purchase was
                    made from.
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
                    The amount of GST that was paid. Only fill this in if you
                    have submitted a Tax Invoice. In all other cases leave as $0
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item expand-separator label="Description">
                <q-card>
                  <q-card-section>
                    A short 1 sentence description for the transaction, why did
                    you make this transaction.<br />
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
                  <q-card-section>
                    Submit the Transaction
                  </q-card-section>
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
        <!-- </q-item-section> -->
      </q-item>
      <q-item
        v-show="
          isAdmin ||
            (project.contributorTransTypeOpts &&
              project.contributorTransTypeOpts.length > 1)
        "
      >
        <!-- {{ project }} -->
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          v-if="isAdmin"
          :value="newTrans.category"
          dense
          label="Category"
          :options="categoryOptions"
          @input="newTrans.category = $event"
          style="
            width:50%
          "
          :rules="[v => !!v || 'Required value']"
          :disable="isContributor"
          hide-bottom-space
        >
        </q-select>
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          v-show="
            isAdmin ||
              (project.contributorTransTypeOpts &&
                project.contributorTransTypeOpts.length > 1)
          "
          v-model="newTrans.type"
          dense
          label="Type"
          :options="typeOptions"
          :style="
            project.contributorTransTypeOpts &&
            project.contributorTransTypeOpts.length > 1
              ? 'width:100%;'
              : 'width:50%;'
          "
          :rules="[v => !!v || 'Required value']"
          hide-bottom-space
        />
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-if="newTrans.category === 'Expense'">
        <!-- <q-item-section> -->
        <q-firebase-uploader
          :metadata="{
            customMetadata: {
              projectId: project.id,
              transId: transRef.id,
              expiry: expiry(1)
            }
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
                  @input="() => $refs.qDateProxy.hide()"
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
        <q-select
          :value="
            newTrans.budget > ''
              ? budgets[newTrans.budget]
                ? budgets[newTrans.budget].label
                : accounts[newTrans.budget].label
              : ''
          "
          dense
          label="Budget"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="item => (item === null ? null : item.id)"
          @input="newTrans.budget = $event.id"
          :style="newTrans.category === 'Expense' ? 'width:50%' : 'width:100%'"
          use-input
          @filter="filterBudgets"
          :rules="[
            v => newTrans.category !== 'Journal' || !!v || 'Required value'
          ]"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model="newTrans.payTo"
          dense
          label="Business"
          style="width:50%"
          v-if="newTrans.category === 'Expense'"
          :rules="[v => v > '' || 'Required']"
        />
      </q-item>
      <q-item v-if="newTrans.category === 'Journal'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="
            newTrans.from > ''
              ? budgets[newTrans.from]
                ? budgets[newTrans.from].label
                : accounts[newTrans.from].label
              : ''
          "
          dense
          label="From"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="item => (item === null ? null : item.id)"
          @input="newTrans.from = $event.id"
          style="width:50%"
          use-input
          @filter="filterBudgets"
          :rules="[
            v => !!v || 'Required value',
            newTrans.to !== newTrans.from ||
              'To & From accounts must be different'
          ]"
          hide-bottom-space
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-select
          :value="
            newTrans.to > ''
              ? budgets[newTrans.to]
                ? budgets[newTrans.to].label
                : accounts[newTrans.to].label
              : ''
          "
          dense
          label="To"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="item => (item === null ? null : item.id)"
          @input="newTrans.to = $event.id"
          style="width:50%"
          use-input
          @filter="filterBudgets"
          hide-bottom-space
          :rules="[
            v => !!v || 'Required value',
            newTrans.to !== newTrans.from ||
              'To & From accounts must be different'
          ]"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
      </q-item>
      <q-item v-if="newTrans.type === 'Cheque'">
        <!-- <q-item-section> -->
        <!-- <q-popup-edit v-model="props.row.category"> -->
        <q-input
          v-model="newTrans.cheque"
          dense
          label="Cheque #"
          style="width:100%"
          :rules="[v => !!v || 'Required value']"
        />
        <!-- </q-popup-edit> -->
        <!-- </q-item-section> -->
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
        <q-input
          v-if="newTrans.category === 'Expense' && newTrans.receipt"
          v-model="newTrans.GST"
          dense
          :label="'GST (' + this.project.currency + ')'"
          :rules="[
            v =>
              parseFloat(v) <= parseFloat(newTrans.amount) * 0.1 ||
              'GST must be <= 10% of amount',
            v => !!v || 'Required value'
          ]"
          style="width:50%"
          prefix="$"
        />
      </q-item>
      <q-item>
        <q-input
          v-model="newTrans.desc"
          dense
          label="Description"
          style="width:100%"
          :rules="[v => v > '' || 'Description Required']"
        />
      </q-item>
      <q-item v-if="error > ''" class="text-red">
        {{ error }}
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
</template>

<script>
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/firestore')

export default {
  data() {
    return {
      newTrans: {
        budget: '',
        from: '',
        to: '',
        type: 'Cash',
        date: '',
        amount: '',
        GST: '0',
        cheque: '',
        receipt: false,
        desc: '',
        category: 'Expense',
        reviewed: false,
        payTo: ''
      },
      error: '',
      transRef: {},
      readOnly: false,
      uploading: false,
      budgetsFiltered: []
    }
  },
  created() {
    // this.$q.dark.set(true)
    // console.log(`/projects/${this.projectId}/transactions`)
    this.transRef = firebase
      .firestore()
      .collection(`/projects/${this.project.id}/transactions`)
      .doc()
    let date = new Date()
    this.newTrans.date = `${date
      .getDate()
      .toString()
      .padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
    // this.$store.dispatch('fetchAccounts', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  methods: {
    onLog(event) {
      // console.log(event)
    },
    onAdded(files) {
      console.log('file added', files)
      // files[0].name = 'blah.jpeg'
    },
    onStart(event) {
      console.log('upload started', event)
      this.uploading = true
    },
    onSubmit() {
      this.error = ''
      // console.log('submitting form', this.newTrans)
      if (
        this.isContributor &&
        this.newTrans.category === 'Expense' &&
        this.newTrans.receipt !== true &&
        parseFloat(this.newTrans.amount) > 10
      ) {
        this.error =
          'Please submit a receipt. If a Tax Invoice is not available, submit an eftpos receipt and set the GST to $0'
        return
      }
      console.log(
        this.newTrans,

        this.newTrans.category === 'Journal' &&
          !this.budgetsFiltered.some(val => val.id === this.newTrans.to) &&
          !this.budgetsFiltered.some(val => val.id === this.newTrans.from),
        this.newTrans.category !== 'Journal' &&
          !this.budgetsFiltered.some(val => val.id === this.newTrans.budget)
      )
      if (
        (this.newTrans.category === 'Journal' &&
          !this.budgetsFiltered.some(val => val.id === this.newTrans.to) &&
          !this.budgetsFiltered.some(val => val.id === this.newTrans.from)) ||
        (this.newTrans.category !== 'Journal' &&
          !this.budgetsFiltered.some(val => val.id === this.newTrans.budget))
      ) {
        this.error = 'Budget Missing'
        return
      }
      this.$q.loading.show()
      this.newTrans.cheque =
        this.newTrans.type === 'Cheque' ? this.newTrans.cheque : ''
      this.newTrans.GST =
        this.newTrans.category === 'Expense' && this.newTrans.receipt === true
          ? this.newTrans.GST
          : 0

      this.newTrans.to =
        this.newTrans.category === 'Journal' ? this.newTrans.to : 0
      this.newTrans.from =
        this.newTrans.category === 'Journal' ? this.newTrans.from : 0
      this.newTrans.budget =
        this.newTrans.category !== 'Journal' ? this.newTrans.budget : 0
      this.newTrans.amount =
        typeof this.newTrans.amount === 'string'
          ? this.newTrans.amount.replace(',', '')
          : this.newTrans.amount
      this.newTrans.amount =
        this.newTrans.type === 'Cash'
          ? round5(this.newTrans.amount)
          : this.newTrans.amount
      this.newTrans.submittedBy = this.user
      this.transRef
        .set(this.newTrans)
        .then(res => {
          // console.log('form submitted', res)
          this.$q.loading.hide()
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`
          })
          this.$refs.transForm.reset()
          this.$emit('onSubmit', this.newTrans)
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
      // console.log('form reset')
      this.newTrans = {
        budget: '',
        from: '',
        to: '',
        type: 'Cash',
        date: '',
        amount: '',
        GST: '',
        cheque: '',
        receipt: false,
        desc: '',
        category: 'Expense',
        reviewed: false
      }
      this.transRef = firebase
        .firestore()
        .collection(`/projects/${this.project.id}/transactions`)
        .doc()
      this.readOnly = false
      let date = new Date()
      // console.log(
      //   this.newTrans.date,
      //   `${date
      //     .getDate()
      //     .toString()
      //     .padStart(2, '0')}/${(date.getMonth() + 1)
      //     .toString()
      //     .padStart(2, '0')}/${date.getFullYear()}`
      // )
      this.newTrans.date = `${date
        .getDate()
        .toString()
        .padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
      this.$refs.transUpload.reset()
    },
    onUploaded(event) {
      console.log('file uploaded', event)
      this.readOnly = true
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Receipt Uploaded'
      })
      this.newTrans.receipt = true
      this.uploading = false
    },
    onFailed(event) {
      console.log('file upload failed', event)
      this.$q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Upload Failed'
      })
      this.uploading = false
    },
    expiry(numDays) {
      var date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    },
    filterBudgets(val, update) {
      // console.log(this.budgetOptions)
      let budgets = this.isAdmin ? this.budgetOptions : this.contributorBudgets
      // console.log(budgets)
      if (val === '') {
        update(() => {
          this.budgetsFiltered = budgets
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.budgetsFiltered = budgets.filter(
          v => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'accounts',
      'budgets',
      'budgetCategories',
      'budgetOptions',
      'contributorBudgets',
      'isAdmin',
      'isContributor',
      'user'
    ]),
    typeOptions() {
      // this.isContributor &&
      return this.isContributor &&
        this.project.contributorTransTypeOpts &&
        this.project.contributorTransTypeOpts.length > 0
        ? this.project.contributorTransTypeOpts
        : ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']
    },
    isValid() {
      // console.log(
      //   this.newTrans.to !== '' &&
      //     this.newTrans.from !== '' &&
      //     this.newTrans.to === this.newTrans.from
      // )
      return (
        this.newTrans.category === 'Journal' &&
        this.newTrans.to > '' &&
        this.newTrans.from > '' &&
        this.newTrans.to === this.newTrans.from
      )
    },
    categoryOptions() {
      return this.isAdmin ? ['Expense', 'Income', 'Journal'] : ['Expense']
    }
  },
  watch: {
    project() {
      this.transRef = firebase
        .firestore()
        .collection(`/projects/${this.project.id}/transactions`)
        .doc()
    }
  },
  components: {
    'q-firebase-uploader': () => import('../components/q-firebase-uploader.vue')
  }
}
</script>
