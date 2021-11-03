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
          where('completed', '==', false)
        )
      )
      if (docs.docs.length > 0) {
        return {
          error:
            docs.docs.length > 1
              ? `You have ${docs.docs.length} incompete Actions. Please complete or delete them before continuing.`
              : `You have ${docs.docs.length} incompete Action. Please complete or delete it before continuing.`,
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
          where('balance', '>', 0.01),
          where('type', '==', 'budget')
        )
      )
      if (docs.docs.length > 0) {
        return {
          error:
            docs.docs.length > 1
              ? `You have ${docs.docs.length} Budgets with remaining cash. Please ensure you have received any outstanding cash and recorded all transactions.`
              : `You have ${docs.docs.length} Budget with remaining cash. Please ensure you have received any outstanding cash and recorded all transactions.`,
        }
      }
      return true
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
  },
}
</script>
