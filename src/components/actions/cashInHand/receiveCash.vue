<template>
  <div>
    Once all of the expenses have been logged, you need to get the remaining
    money back from
    {{
      responsiblePerson.uid ? responsiblePerson.name : 'the Responsible Person'
    }}. You should expect to receive a total of
    <b>${{ remainingBalance ? parseFloat(remainingBalance) : 0 }}</b>
    in cash{{
      newTrans.amount > 0 && !amountReturned
        ? `, an additional
    $${(
      remainingBalance - parseFloat(newTrans.amount > 0 ? newTrans.amount : 0)
    ).toFixed(2)}.`
        : '.'
    }}
    <q-list>
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
          :label="'Amount (' + project.currency + ')'"
          :rules="[(v) => !!v || 'Required value']"
          :style="newTrans.receipt ? 'width:50%;' : 'width: 100%;'"
          prefix="$"
        />
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore'

export default {
  name: 'receiveCash',
  props: ['action', 'transactions', 'responsiblePerson'],
  setup(props, { emit }) {
    const store = useStore()
    const route = useRoute()
    const q = useQuasar()
    // variables
    const transRef = ref({})
    const newTrans = ref({
      to: 'pettyCash',
      from: '',
      type: 'Cash',
      date: '',
      amount: '',
      GST: 0,
      desc: 'Cash Returned',
      category: 'Journal',
      reviewed: true,
    })

    function fetchTransById(val) {
      return store.dispatch('transactions/fetchTransById', val)
    }
    async function save() {
      newTrans.value.amount =
        typeof newTrans.value.amount === 'string'
          ? newTrans.value.amount.replace(',', '')
          : newTrans.value.amount
      newTrans.value.submittedBy = user.value
      newTrans.value.action = props.action.id
      console.log(transRef.value, newTrans.value)
      return await setDoc(transRef.value, newTrans.value)
        .then((res) => {
          // console.log('form submitted', res)
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: `Transaction: Submitted Successfully`,
          })
          // onReset()
          emit('onSubmit', newTrans.value)
          return transRef.value.id
        })
        .catch((err) => {
          console.error(err)
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    }
    function onReset() {
      // console.log('form reset')
      let date = new Date()
      newTrans.value = {
        from: props.action.budget,
        to: 'pettyCash',
        type: 'Cash',
        date: `${date.getDate().toString().padStart(2, '0')}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${date.getFullYear()}`,
        amount: '',
        receipt: false,
        desc: 'petty cash out',
        category: 'Journal',
        reviewed: true,
      }
    }
    const project = computed(() => store.getters['projects/project'])
    const user = computed(() => store.getters['auth/user'])
    const admins = computed(() => store.getters['auth/admins'])
    const contributors = computed(() => store.getters['auth/contributors'])
    const remainingBalance = computed(() => {
      let total = 0
      for (let trans in props.action.transactions) {
        if (props.action.transactions[trans].purpose === 'cash-in-hand') {
          total += parseFloat(
            props.transactions[trans] && props.transactions[trans].amount > 0
              ? props.transactions[trans].amount
              : 0
          )
        } else if (props.action.transactions[trans].purpose === 'expense') {
          total -= parseFloat(
            props.transactions[trans] && props.transactions[trans].amount > 0
              ? props.transactions[trans].amount
              : 0
          )
        }
        // else if (
        //   props.action.transactions[trans].purpose === 'cash-returned'
        // ) {
        //   total -= parseFloat(
        //     props.transactions[trans] && props.transactions[trans].amount > 0
        //       ? props.transactions[trans].amount
        //       : 0
        //   )
        // }
      }
      return total.toFixed(2)
    })
    const amountReturned = computed(() => {
      return (
        remainingBalance.value -
          parseFloat(newTrans.value.amount > 0 ? newTrans.value.amount : 0) <
        0.05
      )
    })
    let found = false
    if (props.action && props.action.transactions) {
      for (let trans in props.action.transactions) {
        if (props.action.transactions[trans].purpose === 'cash-returned') {
          transRef.value = doc(
            getFirestore(),
            `/projects/${project.value.id}/transactions/${trans}`
          )
          fetchTransById({
            projectId: route.params.id,
            id: trans,
          }).then((res) => (newTrans.value = res))
          found = true
          break
        }
      }
    }
    if (!found) {
      transRef.value = doc(
        collection(getFirestore(), `/projects/${project.value.id}/transactions`)
      )
    }

    newTrans.value.from = props.action.budget

    let date = new Date()
    newTrans.value.date = `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`

    newTrans.value.desc = `Return of remaining cash from ${
      admins.value.length > 0 &&
      admins.value.find((x) => x.uid === props.action.responsiblePerson)
        ? admins.value.find((x) => x.uid === props.action.responsiblePerson)
            .name
        : contributors.value.length > 0 &&
          contributors.value.find(
            (x) => x.uid === props.action.responsiblePerson
          )
        ? contributors.value.find(
            (x) => x.uid === props.action.responsiblePerson
          ).name
        : ''
    } for ${
      props.action.desc.split('for ')[
        props.action.desc.split('for ').length - 1
      ]
    }`

    watch(project, async () => {
      if (props.action && props.action.transactions) {
        for (let trans in props.action.transactions) {
          if (props.action.transactions[trans].purpose === 'cash-returned') {
            transRef.value = doc(
              getFirestore(),
              `/projects/${project.value.id}/transactions/${trans}`
            )
            newTrans.value = await fetchTransById({
              projectId: route.params.id,
              id: trans,
            })
            return
          }
        }
      }
      if (!transRef.value) {
        transRef.value = doc(
          collection(
            getFirestore(),
            `/projects/${project.value.id}/transactions`
          )
        )
      }
    })

    return {
      save,
      onReset,
      fetchTransById,
      project,
      user,
      newTrans,
      remainingBalance,
      transRef,
      amountReturned,
    }
  },
}
</script>
