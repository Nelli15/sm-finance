<template>
  <q-form @reset="onReset" @submit="onSubmit" ref="transForm">
    <q-list style="min-width: 100px">
      <q-item class="text-h6 justify-center" v-if="!hideHeaders">
        Transaction
        <q-icon
          name="help_outline"
          style="cursor: pointer"
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
      <q-item
        v-show="
          (isAdmin ||
            (project.contributorTransTypeOpts &&
              project.contributorTransTypeOpts.length > 1)) &&
          (fields.includes('category') || fields.includes('type'))
        "
      >
        <q-select
          v-if="isAdmin && fields.includes('category')"
          :model-value="newTrans.category"
          dense
          label="Category"
          :options="isAdmin ? ['Expense', 'Income', 'Journal'] : ['Expense']"
          @update:model-value="newTrans.category = $event"
          style="width: 50%"
          :rules="[(v) => !!v || 'Required value']"
          :disable="isContributor || !!transaction.id"
          hide-bottom-space
        >
        </q-select>
        <q-select
          v-show="
            (isAdmin ||
              (project.contributorTransTypeOpts &&
                project.contributorTransTypeOpts.length > 1)) &&
            fields.includes('type')
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
          :rules="[(v) => !!v || 'Required value']"
          hide-bottom-space
        />
      </q-item>
      <q-item
        v-if="newTrans.category === 'Expense' && fields.includes('receipt')"
      >
        <fileUploader
          :existingURL="newTrans.receiptURL"
          :metadata="metadata"
          color="secondary"
          flat
          bordered
          style="max-width: 500px"
          class="q-mx-auto"
          ref="transUpload"
          @uploaded="onUploaded"
          @failed="onFailed"
          @start="onStart"
          auto-upload
          hide-upload-btn
          accept=".jpg, image/*"
          dark
          :label="readOnly ? 'Receipt Submitted' : 'Upload Receipt Image'"
          :readonly="readOnly"
          :disabled="readOnly"
        />
      </q-item>
      <q-item v-if="fields.includes('date')">
        <q-input
          v-if="fields.includes('date')"
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
      </q-item>

      <q-item
        v-if="
          newTrans.category !== 'Journal' &&
          (fields.includes('budget') || fields.includes('payTo'))
        "
      >
        <q-select
          v-if="fields.includes('budget')"
          :model-value="budgetFromId(newTrans.budget)"
          dense
          label="Budget"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="(item) => (item === null ? null : item.id)"
          @update:model-value="
            (e) => {
              newTrans.budget = e.id
              newTrans.action = null
            }
          "
          :style="
            newTrans.category === 'Expense' && fields.includes('payTo')
              ? 'width:50%'
              : 'width:100%'
          "
          use-input
          @filter="filterBudgets"
          :rules="[
            (v) => newTrans.category !== 'Journal' || !!v || 'Required value',
          ]"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model="newTrans.payTo"
          dense
          label="Business"
          :style="fields.includes('budget') ? 'width:50%' : 'width:100%'"
          v-if="newTrans.category === 'Expense' && fields.includes('payTo')"
          :rules="[(v) => v > '' || 'Required']"
        />
      </q-item>
      <q-item
        v-if="newTrans.category === 'Journal' && fields.includes('budget')"
      >
        <q-select
          :model-value="budgetFromId(newTrans.from)"
          dense
          label="From"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="(item) => (item === null ? null : item.id)"
          @update:model-value="newTrans.from = $event.id"
          style="width: 50%"
          use-input
          @filter="filterBudgets"
          :rules="[
            (v) => !!v || 'Required value',
            (v) =>
              newTrans.to !== newTrans.from || 'To & From must be different',
          ]"
          hide-bottom-space
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select
          :model-value="budgetFromId(newTrans.to)"
          dense
          label="To"
          :options="budgetsFiltered"
          option-label="label"
          :option-value="(item) => (item === null ? null : item.id)"
          @update:model-value="newTrans.to = $event.id"
          style="width: 50%"
          use-input
          @filter="filterBudgets"
          hide-bottom-space
          :rules="[
            (v) => !!v || 'Required value',
            (v) =>
              newTrans.to !== newTrans.from || 'To & From must be different',
          ]"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-item>
      <q-item v-if="newTrans.type === 'Cheque' && fields.includes('cheque')">
        <q-input
          v-model="newTrans.cheque"
          dense
          label="Cheque #"
          style="width: 100%"
          :rules="[(v) => !!v || 'Required value']"
        />
      </q-item>
      <q-item v-if="fields.includes('amount') || fields.includes('GST')">
        <q-currency-input
          v-if="fields.includes('amount')"
          :label="'Amount (' + project.currency + ')'"
          :rules="[(v) => !!v || 'Required value']"
          :style="
            newTrans.receipt && fields.includes('GST')
              ? 'width:50%;'
              : 'width: 100%;'
          "
          :model-value="newTrans.amount.value"
          @update:model-value="
            (e) => {
              newTrans.amount = currency(e)
            }
          "
          :options="{
            currency: 'AUD',
            useGrouping: true,
            currencyDisplay: 'hidden',
          }"
        />
        <q-currency-input
          v-if="
            newTrans.category === 'Expense' &&
            newTrans.receipt &&
            fields.includes('GST')
          "
          :label="'GST (' + project.currency + ')'"
          :rules="[
            (v) => v <= newTrans.amount * 0.1 || 'GST must be <= 10% of amount',
            (v) => !!v || 'Required value',
          ]"
          style="width: 50%"
          :model-value="newTrans.GST.value"
          @update:model-value="
            (e) => {
              newTrans.GST = currency(e)
            }
          "
          :options="{
            currency: 'AUD',
            useGrouping: true,
            currencyDisplay: 'hidden',
          }"
        />
      </q-item>
      <q-item v-if="fields.includes('desc')">
        <q-input
          v-model="newTrans.desc"
          dense
          label="Description"
          style="width: 100%"
          :rules="[(v) => v > '' || 'Description Required']"
        />
      </q-item>
      <q-item
        v-if="
          fields.includes('action') &&
          newTrans.category == 'Expense' &&
          !accounts[newTrans.budget]
        "
      >
        <q-select
          v-model="newTrans.action"
          dense
          autofocus
          cover
          label="Action"
          :options="
            actionOptions.filter(
              (val) =>
                !val.complete && val.budget && val.budget === newTrans.budget
            )
          "
          style="width: 100%"
          map-options
          emit-value
          option-label="desc"
          option-value="id"
          :display-value="
            newTrans.action && actions[newTrans.action]
              ? actions[newTrans.action].desc
              : ''
          "
          clearable
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.desc }}</q-item-label>
                <q-item-label caption>{{
                  scope.opt.responsiblePerson
                    ? `(${users[scope.opt.responsiblePerson].name})`
                    : ''
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-italic text-grey">
                No uncompleted Actions are linked with this Budget
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:after>
            <create-action-from-expense
              :transaction="newTrans"
              v-if="!newTrans.action"
            />
          </template>
        </q-select>
      </q-item>

      <q-item v-if="error > '' && !hideErrors" class="text-red">
        {{ error }}
      </q-item>
      <q-item v-if="!hideBtns">
        <q-btn
          label="Save"
          type="submit"
          color="secondary"
          :disable="uploading"
        />
        <q-btn
          v-if="!hideClear"
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
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import {
  getFirestore,
  setDoc,
  doc,
  collection,
  getDoc,
  updateDoc,
  deleteField,
} from 'firebase/firestore'
import currency from 'currency.js'
import { Transaction } from '/src/services/transaction'
export default {
  props: {
    actionId: String,
    transaction: {},
    fields: Array,
    hideBtns: Boolean,
    hideHeaders: Boolean,
    hideErrors: Boolean,
    hideClear: Boolean,
  },
  emit: ['onSubmit', 'onError'],
  setup(props, { emit }) {
    //set standard imports
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()

    //fetch the budgets
    store.dispatch('budgets/fetchBudgets', route.params.id)

    //import required values from store
    const project = computed(() => store.getters['projects/project'])
    const isAdmin = computed(() => store.getters['projects/isAdmin'])
    const isContributor = computed(
      () => store.getters['projects/isContributor']
    )
    const user = computed(() => store.getters['auth/user'])
    const actionOptions = computed(() => store.getters['actions/actionOptions'])
    const actions = computed(() => store.getters['actions/actions'])
    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])

    // define document variables
    const typeOptions = computed(() => {
      let options =
        isContributor &&
        project.contributorTransTypeOpts &&
        project.contributorTransTypeOpts.length > 0
          ? project.contributorTransTypeOpts
          : ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']
      return options
    })
    const users = computed(() => {
      let arr = [...admins.value, ...contributors.value]
      return arr.reduce(
        (obj, item) => ({
          ...obj,
          [item['uid']]: item,
        }),
        {}
      )
    })
    const oldAction = ref(null)
    const transRef = ref({})
    const newTrans = ref({})
    const fields = computed(() => {
      return Array.isArray(props.fields)
        ? props.fields
        : [
            'category',
            'type',
            'receipt',
            'date',
            'budget',
            'cheque',
            'amount',
            'GST',
            'desc',
            'payTo',
            'action',
          ]
    })
    const error = ref('')
    const readOnly = ref(false)
    const uploading = ref(false)

    // a function for rounding amount if cash
    function round5(x) {
      var mod = (x - Math.floor(x)) * 100
      if (mod % 5 > 0) {
        mod % 5 <= 2 ? (mod = mod - (mod % 5)) : (mod = mod + (5 - (mod % 5)))
        return Math.floor(x) + mod / 100
      } else {
        return x
      }
    }

    // saves the transaction
    async function onSubmit(actionId) {
      if (!actionId || typeof actionId !== 'string') {
        if (props.actionId) {
          actionId = props.actionId
        } else {
          actionId = ''
        }
      }

      // reset the error
      error.value = ''

      // check a receipt is submitted if expense over $10
      if (
        isContributor.value &&
        newTrans.value.category === 'Expense' &&
        newTrans.value.receipt !== true &&
        newTrans.value.amount > 10
      ) {
        error.value =
          'Please submit a receipt. If a Tax Invoice is not available, submit an eftpos receipt and set the GST to $0'
        return
      }
      // check if the journal budget is valid
      if (
        (newTrans.value.category === 'Journal' &&
          !(
            budgetFromId(newTrans.value.to).id &&
            budgetFromId(newTrans.value.from).id
          )) ||
        (newTrans.value.category !== 'Journal' &&
          !budgetFromId(newTrans.value.budget).id)
      ) {
        error.value = 'Budget Missing'
        return
      }
      // check that the to and from are not the same in a journal transaction
      if (
        newTrans.value.category === 'Journal' &&
        newTrans.value.to === newTrans.value.from
      ) {
        error.value = 'To and From must be different'
        return
      }
      // show the loading spinner
      q.loading.show()
      let l_newTrans = JSON.parse(JSON.stringify(newTrans.value))
      // check GST is correct
      l_newTrans.GST =
        l_newTrans.category === 'Expense' && l_newTrans.receipt === true
          ? l_newTrans.GST
          : 0
      // check the budgets are valid
      l_newTrans.to = l_newTrans.category === 'Journal' ? l_newTrans.to : ''
      l_newTrans.from = l_newTrans.category === 'Journal' ? l_newTrans.from : ''
      l_newTrans.budget =
        l_newTrans.category !== 'Journal' ? l_newTrans.budget : ''

      l_newTrans.amount = currency(l_newTrans.amount).value
      l_newTrans.amount =
        l_newTrans.type === 'Cash'
          ? round5(l_newTrans.amount)
          : l_newTrans.amount
      l_newTrans.submittedBy = user.value
      l_newTrans.action =
        l_newTrans.action > ''
          ? l_newTrans.action
          : actionId > ''
          ? actionId
          : null
      l_newTrans = JSON.parse(JSON.stringify(l_newTrans))
      l_newTrans.id = transRef.value.id ? transRef.value.id : ''
      // Save the dec to the server
      // console.log(transRef.value.id, l_newTrans)
      return setDoc(transRef.value, l_newTrans, { merge: true })
        .then(async () => {
          // update the action
          console.log(
            l_newTrans.action,
            oldAction.value,
            l_newTrans.action !== oldAction.value
          )
          if (l_newTrans.action !== oldAction.value) {
            if (l_newTrans.action > '') {
              let purpose = null
              if (oldAction.value > '') {
                // get old action value from transaction
                const docSnap = await getDoc(
                  doc(
                    getFirestore(),
                    `/projects/${project.value.id}/actions/${oldAction.value}`
                  )
                )
                if (docSnap.exists()) {
                  purpose = docSnap.get(`transaction.${l_newTrans.id}.purpose`)
                }
              }
              //add the transaction to the action
              console.log(
                `update: /projects/${project.value.id}/actions/${
                  l_newTrans.action
                } with ${JSON.stringify({
                  [`transactions.${l_newTrans.id}`]: {
                    purpose: purpose ? purpose : 'expense',
                    id: l_newTrans.id,
                  },
                })}`,
                l_newTrans.action > ''
              )
              await updateDoc(
                doc(
                  getFirestore(),
                  `/projects/${project.value.id}/actions/${l_newTrans.action}`
                ),
                {
                  [`transactions.${l_newTrans.id}`]: {
                    purpose: purpose ? purpose : 'expense',
                    id: l_newTrans.id,
                  },
                }
              )
            }
            if (oldAction.value > '') {
              // remove the transaction fron action
              console.log(
                `update: /projects/${project.value.id}/actions/${oldAction.value} with {transactions.${l_newTrans.id}: deleteField()}`,
                oldAction.value
              )
              await updateDoc(
                doc(
                  getFirestore(),
                  `/projects/${project.value.id}/actions/${oldAction.value}`
                ),
                { [`transactions.${l_newTrans.id}`]: deleteField() }
              )
            }
            oldAction.value = l_newTrans.action
          }
        })
        .then(() => {
          emit('onSubmit', l_newTrans)
          q.loading.hide()
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`,
          })

          // Reset the form and uploader
          //only reset if prop doesn't say not to
          // onReset()
          return l_newTrans.id
        })
        .catch((err) => {
          q.loading.hide()
          console.error(err)
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    }

    // resets the transaction
    function onReset() {
      // reset the form if resetOnSubmit prop is true
      newTrans.value = props.transaction
      readOnly.value = false
      // reset the file uploader
      $refs.transUpload.reset()
    }

    // file upload
    function onStart() {
      uploading.value = true
    }
    function onUploaded() {
      readOnly.value = true
      q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Receipt Uploaded',
      })
      newTrans.value.receipt = true
      uploading.value = false
    }
    function onFailed() {
      q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Upload Failed',
      })
      uploading.value = false
    }
    function expiry(numDays) {
      var date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    }
    const metadata = computed(() => {
      return {
        customMetadata: {
          projectId: route.params.id,
          transId: transRef.value.id,
          expiry: expiry(1),
        },
      }
    })

    //data related to budgets
    const budgetsFiltered = ref([])
    const contributorBudgets = computed(
      () => store.getters['budgets/contributorBudgets']
    )
    const accounts = computed(() => store.getters['budgets/accounts'])
    const budgets = computed(() => store.getters['budgets/budgets'])
    const budgetOptions = computed(() => store.getters['budgets/budgetOptions'])
    function filterBudgets(val, update) {
      let budgets = isAdmin.value
        ? budgetOptions.value
        : contributorBudgets.value
      if (val === '') {
        update(() => {
          budgetsFiltered.value = budgets
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        budgetsFiltered.value = budgets.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    }
    function budgetFromId(id) {
      if (
        !(
          id > '' &&
          store.state.budgets.budgets &&
          store.state.budgets.accounts
        )
      )
        return { label: '' }
      return (
        store.state.budgets.budgets[id] ||
        store.state.budgets.accounts[id] || { label: '' }
      )
    }

    //watch props to compute Firebase doc ref
    watch(
      computed(() => props.transaction || null),
      (newVal, oldVal) => {
        console.log(newVal, newVal && oldVal && oldVal.action !== newVal.action)
        if (
          (newVal && oldVal && oldVal.id !== newVal.id) ||
          !transRef.value ||
          !oldVal
        ) {
          if (newVal && newVal.id) {
            transRef.value = doc(
              getFirestore(),
              `/projects/${route.params.id}/transactions/${newVal.id}`
            )
            newTrans.value = new Transaction(props.transaction)
          } else if (newVal) {
            transRef.value = doc(
              collection(
                getFirestore(),
                `/projects/${route.params.id}/transactions`
              )
            )
            newTrans.value = new Transaction({
              id: transRef.value.id,
              ...props.transaction,
            })
          } else {
            transRef.value = doc(
              collection(
                getFirestore(),
                `/projects/${route.params.id}/transactions`
              )
            )
            newTrans.value = new Transaction({
              id: transRef.value.id,
              ...newTrans.value,
            })
          }
          if (newVal) oldAction.value = newVal.action
        } else if (newVal && oldVal.action !== newVal.action) {
          console.log('setAction', oldVal, newVal)
          newTrans.value.action = newVal.action
          console.log(newTrans.value)
        }
      },
      { immediate: true }
    )

    watch(error, () => {
      emit('onError', error.value)
    })

    watch(
      computed(() => newTrans.value && newTrans.value.date),
      () => {
        if (
          newTrans.value &&
          (newTrans.value.date <= '' || typeof newTrans.value.date !== 'string')
        ) {
          let date = new Date()
          newTrans.value.date = `${date
            .getDate()
            .toString()
            .padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`
        }
      },
      { immediate: true }
    )

    return {
      q,
      newTrans,
      error,
      typeOptions,
      actions,
      actionOptions,
      user,
      users,
      onSubmit,
      currency,
      project,
      metadata,
      budgets,
      accounts,
      filterBudgets,
      budgetsFiltered,
      budgetFromId,
      uploading,
      readOnly,
      onFailed,
      onUploaded,
      onReset,
      onStart,
      fields: props.fields,
      isAdmin,
      isContributor,
      fields,
      transRef,
      hideHeaders: props.hideHeaders,
      hideBtns: props.hideBtns,
      log: (val) => console.log(val),
      oldAction,
    }
  },
  components: {
    fileUploader: defineAsyncComponent(() => import('./fileUploader.vue')),
    'q-currency-input': defineAsyncComponent(() => import('./QCurrencyInput')),
    'create-action-from-expense': defineAsyncComponent(() =>
      import('./createActionFromExpense.vue')
    ),
  },
}
</script>
