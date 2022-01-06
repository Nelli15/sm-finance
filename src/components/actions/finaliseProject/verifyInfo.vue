<template>
  <div>
    Before you can finalise the Project, we need to check that all the data is
    ready to be sent to National Summer Projects. Click Verify to get
    started.<br /><br />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getFirestore,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore'

export default {
  name: 'verifyInfo',
  data() {
    return {
      state: false,
    }
  },
  created() {},
  methods: {
    save() {
      return updateProject(this.$route.params.id, this.info)
    },
    async verify() {
      let docs = await getDocs(
        query(
          collection(
            getFirestore(),
            `/projects/${this.$route.params.id}/actions`
          ),
          where('complete', '==', false),
          where('type', '!=', 'close')
        )
      )
      console.log('actions:', docs.size)
      if (docs.size > 1) {
        return {
          error:
            docs.docs.length > 2
              ? `You have ${
                  docs.docs.length - 1
                } incompete Actions. Please complete or delete them before continuing.`
              : `You have 1 incompete Action. Please complete or delete it before continuing.`,
        }
      }
      docs = await getDocs(
        query(
          collection(
            getFirestore(),
            `/projects/${this.$route.params.id}/transactions`
          ),
          where('reviewed', '==', false)
        )
      )
      if (docs.docs.length > 0) {
        return {
          error:
            docs.docs.length > 1
              ? `You have ${docs.docs.length} transactions awaiting review. Please review them all before continuing.`
              : `You have ${docs.docs.length} Transaction awaiting review. Please review it before continuing.`,
        }
      }
      docs = await getDocs(
        query(
          collection(
            getFirestore(),
            `/projects/${this.$route.params.id}/accounts`
          ),
          where('balance', '>', 0),
          where('type', '==', 'budget')
        )
      )
      console.log('budgets', docs)
      if (docs.docs.length > 0) {
        return {
          error:
            docs.docs.length > 1
              ? `You have ${docs.docs.length} Budgets with remaining cash. Please ensure you have received any outstanding cash and recorded all transactions.`
              : `You have ${docs.docs.length} Budget with remaining cash. Please ensure you have received any outstanding cash and recorded all transactions.`,
        }
      }
      docs = await getDocs(
        query(
          collection(
            getFirestore(),
            `/projects/${this.$route.params.id}/accounts`
          ),
          where('balance', '<', 0),
          where('type', '==', 'budget')
        )
      )
      console.log('budgets', docs)
      if (docs.docs.length > 0) {
        return {
          error:
            docs.docs.length > 1
              ? `You have ${docs.docs.length} Budgets with unpaid Expenses. Please ensure all budgets have a cash in hand balance of $0`
              : `You have 1 Budget with unpaid Expenses.  Please ensure all budgets have a cash in hand balance of $0`,
        }
      }
      console.log('verified')
      return true
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
  },
}
</script>
