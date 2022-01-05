<template>
  <q-page>
    <actionsTable />
    <actionsStickyFAB />
    <div style="min-height: 60px" />
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { defineAsyncComponent, ref } from 'vue'

var cc = require('currency-codes')

export default {
  name: 'actionsPage',
  preFetch({ store, currentRoute }) {
    store.dispatch('actions/fetchActions', currentRoute.params.id)
    store.dispatch('auth/fetchContributors', currentRoute.params.id)
  },
  setup() {
    const q = useQuasar()
    const route = useRoute()
    const fabPos = ref([18, 18])
    const draggingFab = ref(false)
    return {
      q,
      route,
      draggingFab,
      fabPos,
    }
  },
  components: {
    // 'sp-budget-form': () => import('../components/sp-budget-form.vue'),
    actionsStickyFAB: defineAsyncComponent(() =>
      import('./../components/actionsStickyFAB.vue')
    ),
    // 'sp-receipt': () => import('../components/sp-receipt.vue'),
    actionsTable: defineAsyncComponent(() =>
      import('../components/actionsTable.vue')
    ),
  },
}
</script>

<style lang="sass">
.my-sticky-header-table
  /* max height is important */
  .q-table__middle
    max-height: 100%

  .q-table__top,
  .q-table__bottom,
  /*thead tr:first-child th*/
    /* bg color is important for th; just specify one */
    /*background-color: #c1f4cd*/

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
