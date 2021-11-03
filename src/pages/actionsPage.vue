<template>
  <q-page padding>
    <q-table
      class="my-sticky-header-table"
      :rows="actionOptions"
      :columns="columns"
      :rows-per-page-options="[5, 10, 15, 20, 50, 100, 200]"
      :row-key="(row) => row.id"
      :visible-columns="visibleColumns"
      :filter="filter"
      rows-per-page-label="Actions per page:"
      :pagination.sync="pagination"
      @update:pagination="
        q.localStorage.set('actionsTableRows', $event.rowsPerPage)
      "
      selection="multiple"
      :selected.sync="rowSelected"
      dense
      :loading="loading"
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">
          Actions
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
                      >Actions</q-item-label
                    >
                    <q-item-label caption>
                      Actions record the transfer of money into, out of, and
                      within a Project. A Action should be recorded each time
                      money is moved. There are three types of Actions. <br />
                      <br />
                      When choosing which Action to record, consider any money
                      in the hands of Missionaries and Project Participants as
                      'within' the Project. Money 'outside' the Project includes
                      money in the hands of Summer Project National and venders
                      such as the accomodation and grocery stores.
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-expansion-item
                  expand-separator
                  label="Income (Green)"
                  class="text-green-8"
                >
                  <q-card>
                    <q-card-section>
                      Income Actions record when a Project receives money from
                      outside of the Project, usually from Summer Projects
                      National, and are recorded in green.
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                <q-expansion-item
                  expand-separator
                  label="Journal (Blue)"
                  class="text-blue-8"
                >
                  <q-card>
                    <q-card-section>
                      Journal Actions record money being moved amoungst Accounts
                      and Budgets without leaving the Project and are recorded
                      in blue.
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                <q-expansion-item
                  expand-separator
                  label="Expense (Red)"
                  class="text-red-8"
                >
                  <q-card>
                    <q-card-section>
                      Expense Actions records money leaving the Project and are
                      recorded in red. eg. buying groceries, or returning money
                      to Summer Projects National.
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                <q-expansion-item expand-separator label="Columns">
                  <q-card>
                    <q-card-section>
                      Each Action contains a number of fields that each need to
                      have the correct information in them before the end of the
                      Summer Project. This is what they should contain.<br /><br />
                      <ul>
                        <li>
                          From - The user who submitted the Action (Auto
                          Generated)
                        </li>
                        <li>
                          Action ID - An internal system identifier for the
                          Transactio (Auto Generated)
                        </li>
                        <li>
                          Type - The physical method used for the Action (Cash,
                          Bank Card, Internet Transfer, Cheque)
                        </li>
                        <li>
                          Category - The Category connected to the relevant
                          Budget (Auto Generated)
                        </li>
                        <li>
                          Budget/Account - The Budget/s related to the Action
                        </li>
                        <li>
                          Date - The date that the Action took place, for
                          expense Actions this will be recorded on the Tax
                          Invoice
                        </li>
                        <li>Amount - The amount that was transfered</li>
                        <li>
                          GST - The amount of GST that was spent (Expenses only)
                        </li>
                        <li>
                          Paid To - The supplier/business who the Action was
                          made to (Expenses only)
                        </li>
                        <li>
                          Description - A description of what the Action is, why
                          was it made
                        </li>
                        <li>
                          Cheque # - The number of the cheque (Cheque Actions
                          only)
                        </li>
                      </ul>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                <q-expansion-item
                  expand-separator
                  label="Processing & Reviewing"
                >
                  <q-card>
                    <q-card-section>
                      Each time you/or someone else submits a Action, you need
                      to review it. Once you have checked that all of the
                      details for the Action are correct, click the 'Reviewed?'
                      button. This will lock the Action and prevent Contributors
                      from editing this Action. At the end of the Summer Project
                      all Actions should have been checked and marked as
                      'Reviewed!'. Use the 'Reviewed?' button to keep track of
                      what you have and haven't processed.
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </q-menu>
          </q-icon>
        </div>

        <q-space />

        <!-- <div v-if="q.screen.gt.xs" class="col">
          <q-toggle v-for="column in columns" v-model="visibleColumns" :val="column.name" :label="column.label" :key="column.name" />
        </div>
 -->
        <q-select
          label="Visible Columns"
          v-model="visibleColumns"
          multiple
          borderless
          dense
          options-dense
          :display-value="q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          style="min-width: 150px"
        />

        <q-input borderless dense v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-toggle
          v-model="completedVisible"
          icon="check"
          color="secondary"
          dense
          size="sm"
          class="q-ml-sm"
        >
          <q-tooltip
            anchor="center right"
            self="center left"
            content-class="bg-accent text-black"
          >
            {{ completedVisible ? 'Hide Completed' : 'Show Completed' }}
          </q-tooltip>
        </q-toggle>
        <q-btn
          flat
          round
          dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-sm"
        />
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-if="visibleColumns.includes('selected')">
            <q-checkbox
              dense
              v-model="props.selected"
              class="q-ml-none q-mr-auto"
            />
          </q-th>
          <q-th v-for="col in columnsFiltered" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold">
          <q-td key="selected" :props="props"
            ><q-checkbox v-model="props.selected" dense
          /></q-td>
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="date" :props="props">{{ props.row.date }}</q-td>
          <q-td key="type" :props="props">{{
            (props.row.type === 'petty' && 'Petty Cash Withdrawal') ||
            (props.row.type === 'cashInHand' && 'Cash In Hand') ||
            (props.row.type === 'reimbursement' && 'Reimbursement')
          }}</q-td>
          <q-td key="desc" :props="props">{{ props.row.desc }}</q-td>
          <q-td key="actions" :props="props" auto-width>
            <q-btn
              icon="check"
              round
              :color="props.row.complete ? 'positive' : ''"
              @click="
                updateActionFn(props.row.id, 'complete', !props.row.complete)
              "
              outline
              dense
              class="q-mr-sm shadow-1"
            >
              <q-tooltip
                anchor="center right"
                self="center left"
                content-class="bg-accent text-black"
              >
                {{ props.row.complete ? 'Complete' : 'Mark Complete' }}
              </q-tooltip>
            </q-btn>
            <q-btn
              @click="openDialog(`action-${props.row.id}`)"
              icon="edit"
              dense
              class="q-mr-sm"
            >
              <q-tooltip
                anchor="center right"
                self="center left"
                content-class="bg-accent text-black"
              >
                Edit
              </q-tooltip>
            </q-btn>
            <sp-delete-btn
              dense
              :docRef="`/projects/${project.id}/actions/${props.row.id}`"
              class="q-mr-sm"
            />
          </q-td>
          <q-dialog
            :ref="
              (el) => {
                if (el) refs[`action-${props.row.id}`] = el
              }
            "
            maximised
          >
            <petty-cash
              v-if="props.row.type === 'petty'"
              :action-prop="props.row"
            />
            <cash-in-hand
              v-else-if="props.row.type === 'cashInHand'"
              :action-prop="props.row"
            />
            <reimbursement
              v-else-if="props.row.type === 'reimbursement'"
              :action-prop="props.row"
            />
          </q-dialog>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="fabPos" style="z-index: 100">
      <q-btn
        fab
        icon="add_task"
        color="primary"
        direction="up"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-tooltip content-class="bg-accent text-black">
          Add Actions
        </q-tooltip>
        <q-menu persistent>
          <actionsMenu />
        </q-menu>
      </q-btn>
    </q-page-sticky>
    <div style="min-height: 60px" />
  </q-page>
</template>

<script>
import { debounce, useQuasar } from 'quasar'
import { updateAction } from './../scripts/actions.js'
import { useRoute } from 'vue-router'
import { defineAsyncComponent, ref, computed } from 'vue'
import { useStore } from 'vuex'

var cc = require('currency-codes')

export default {
  name: 'actionsPage',
  preFetch({ store, currentRoute }) {
    store.dispatch('actions/fetchActions', currentRoute.params.id)
    store.dispatch('auth/fetchContributors', currentRoute.params.id)
  },
  setup() {
    const q = useQuasar()
    const store = useStore()
    const route = useRoute()

    const completedVisible = ref(false)
    const refs = ref({})
    const columns = ref([
      {
        name: 'selected',
        label: 'Select',
        field: 'selected',
        align: 'left',
        sortable: true,
      },
      {
        name: 'id',
        label: 'Action ID',
        field: 'id',
        align: 'center',
        sortable: true,
      },
      {
        name: 'date',
        label: 'Date',
        field: 'date',
        align: 'center',
        sortable: true,
        sort: (a, b, rowA, rowB) => {
          let aArray = a.split('/')
          let bArray = b.split('/')
          return (
            new Date(bArray[2], bArray[1], bArray[0]) -
            new Date(aArray[2], aArray[1], aArray[0])
          )
        },
      },
      { name: 'type', label: 'Action Type', field: 'type', align: 'center' },
      { name: 'desc', label: 'Description', field: 'desc', align: 'center' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
    ])
    const filter = ref('')
    const visibleColumns = ref(['selected', 'date', 'type', 'desc', 'actions'])
    const pagination = ref({
      sortBy: 'date',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      // rowsNumber: xx if getting data from a server
    })
    const rowSelected = ref([])
    const fabPos = ref([18, 18])
    const draggingFab = ref(false)

    // updateAction = debounce(updateAction, 1000)
    pagination.value.rowsPerPage = q.localStorage.getItem('transTableRows')
    function updateActionByKey(val) {
      store.dispatch('actions/updateActionByKey', val)
    }
    function openDialog(id) {
      return refs.value[id].show()
    }
    function moveFab(ev) {
      draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

      fabPos.value = [
        fabPos.value[0] + ev.delta.x,
        fabPos.value[1] - ev.delta.y,
      ]
    }
    function updateActionFn(id, key, val) {
      updateActionByKey({ id, key, val })
      updateAction(route.params.id, id, { [key]: val })
        .then(() => {
          q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Action: Updated Successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    }
    const project = computed(() => store.getters['projects/project'])
    const actionOptions = computed(() =>
      store.getters['actions/actionOptions'].filter((val) => {
        if (val.type === 'setup' || val.type === 'close') {
          return false
        } else if (!completedVisible.value === true) {
          return !val.complete
        }
        return true
      })
    )
    const loading = computed(() => store.getters['budgets/loading'])
    const columnsFiltered = computed(() => {
      let cols = []
      for (var key in columns.value) {
        if (columns.value[key].name !== 'selected') {
          cols.push(columns.value[key])
        }
      }
      return cols
    })
    return {
      q,
      refs,
      columns,
      columnsFiltered,
      draggingFab,
      fabPos,
      visibleColumns,
      pagination,
      filter,
      loading,
      rowSelected,
      actionOptions,
      moveFab,
      project,
      updateActionFn,
      openDialog,
      completedVisible,
    }
  },
  components: {
    // 'sp-budget-form': () => import('../components/sp-budget-form.vue'),
    actionsMenu: defineAsyncComponent(() =>
      import('./../components/actionsMenu.vue')
    ),
    // 'sp-receipt': () => import('../components/sp-receipt.vue'),
    'sp-delete-btn': defineAsyncComponent(() =>
      import('../components/sp-delete-btn.vue')
    ),
    'petty-cash': defineAsyncComponent(() =>
      import('./../components/actions/managePettyCash/action.vue')
    ),
    'cash-in-hand': defineAsyncComponent(() =>
      import('./../components/actions/cashInHand/action.vue')
    ),
    reimbursement: defineAsyncComponent(() =>
      import('./../components/actions/reimbursement/action.vue')
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
