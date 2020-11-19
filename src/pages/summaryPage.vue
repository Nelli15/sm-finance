<template>
  <q-page padding>
    <q-banner class="bg-secondary text-white text-center" rounded>
      <q-badge class="bg-secondary text-h4">
        {{ project.name }}
        <q-popup-edit v-model="project.name">
          <q-input
            :value="project.name > '' ? project.name : ''"
            @input="updateProject('name', $event)"
            dense
            autofocus
            label="Project Label"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          content-class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <br />
      <q-badge class="bg-secondary text-subtitle1 q-mb-sm">
        {{ project.number > '' ? project.number : 'Project Code' }}
        <q-popup-edit v-model="project.number" max-width="100px">
          <q-input
            :value="project.number > '' ? project.number : ''"
            @input="updateProject('number', $event)"
            dense
            autofocus
            label="Project Number"
            input-style="max-width:100px;"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          content-class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <br />
      <q-badge class="bg-secondary text-h6">
        {{ project.participants }} Participants
        <q-popup-edit v-model="project.participants">
          <q-input
            :value="project.participants > '' ? project.participants : ''"
            @input="updateProject('participants', $event)"
            dense
            autofocus
            label="Participants"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          content-class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <br />
      <q-badge class="bg-secondary text-subtitle-1">
        Project Currency ({{ project.currency }})
        <q-popup-edit v-model="project.currency">
          <q-input
            :value="project.currency > '' ? project.currency : ''"
            @input="updateProject('currency', $event)"
            dense
            autofocus
            label="Currency"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          content-class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <q-select
        :value="
          project.contributorTransTypeOpts
            ? project.contributorTransTypeOpts
            : []
        "
        @input="
          project.contributorTransTypeOpts = $event
          updateProject('contributorTransTypeOpts', $event)
        "
        dense
        autofocus
        borderless
        label="Contributor Transaction Types"
        multiple
        :options="['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']"
        style="width:250px"
        class="q-mx-auto"
        label-color="white"
        hide-dropdown-icon
      >
        <template v-slot:selected-item="scope">
          <q-chip
            dense
            :tabindex="scope.tabindex"
            text-color="white"
            class="q-ma-none"
            style="background-color: inherit;"
          >
            {{ scope.opt }}
          </q-chip>
        </template>
      </q-select>
    </q-banner>

    <q-table
      class="my-sticky-header-table"
      :data="accountsFiltered"
      :columns="accountColumns"
      title="Accounts"
      :rows-per-page-options="[5, 6, 7, 8, 9, 10, 15, 20, 50, 100]"
      row-key="name"
      :key="'accounts' + tableKey"
      :filter="accountsFilter"
      rows-per-page-label="Accounts per page:"
      :pagination.sync="accountsPagination"
      dense
      @update:pagination="
        $q.localStorage.set('accountsTableRows', $event.rowsPerPage)
      "
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">
          Accounts
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
                      >Accounts</q-item-label
                    >
                    <q-item-label caption>
                      Accounts are physical or digital locations where money is
                      stored. Typically a bank account, bank card or petty cash.
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-icon>
        </div>

        <q-space />
        <q-input
          borderless
          dense
          debounce="300"
          v-model="accountsFilter"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat
          round
          dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold">
          <q-td key="label" :props="props" class="cursor-pointer" auto-width>
            {{ props.row.label }}
            <q-popup-edit v-model="props.row.label">
              <q-input
                :value="props.row.label > '' ? props.row.label : ''"
                @input="updateAccount(props.row.id, 'label', $event)"
                dense
                autofocus
                label="Budget Label"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
            >
              <q-icon name="edit" />Edit
            </q-tooltip>
            <q-badge
              v-if="props.row.transAwaitingReview > 0"
              class="bg-red-8"
              :label="
                props.row.transAwaitingReview
                  ? props.row.transAwaitingReview
                  : ''
              "
              floating
            />
          </q-td>
          <q-td key="balance" :props="props">
            <q-badge
              :class="{
                'bg-green-8': (props.row.balance ? props.row.balance : 0) > 0,
                'bg-red-8': (props.row.balance ? props.row.balance : 0) < 0,
                'bg-black': (props.row.balance ? props.row.balance : 0) == 0
              }"
              :label="
                '$' + (props.row.balance ? props.row.balance : 0).toFixed(2)
              "
            />
          </q-td>
          <!-- <q-td key="awaitingReviews" :props="props">
            {{
              props.row.transAwaitingReview ? props.row.transAwaitingReview : ''
            }}
          </q-td> -->
          <q-td key="actions" :props="props">
            <q-toggle
              :value="props.row.inHeader"
              @input="updateAccount(props.row.id, 'inHeader', $event)"
              icon="view_compact"
            >
              <q-tooltip content-class="bg-accent text-black"
                >View in Header</q-tooltip
              >
            </q-toggle>
            <!-- <q-btn :to="'budget/'+props.row.id" dense class="q-mr-sm">Budgets</q-btn> -->
            <q-btn :to="'transactions/' + props.row.id" dense class="q-mr-sm"
              >Transactions</q-btn
            >
            <q-btn v-if="props.row.inUse" dense color="negative">
              <q-icon name="delete_forever" />
              <q-tooltip content-class="bg-accent text-black"
                >Cannot Delete Budget while in use</q-tooltip
              >
            </q-btn>
            <sp-delete-btn
              dense
              v-if="!props.row.inUse"
              :docRef="`/projects/${project.id}/accounts/${props.row.id}`"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-table
      class="my-sticky-header-table"
      :data="budgetCategoriesFiltered"
      :columns="columns"
      title="Budget Categories"
      :rows-per-page-options="[5, 6, 7, 8, 9, 10, 15, 20, 50, 100]"
      row-key="name"
      :key="'budgets' + tableKey"
      :filter="summaryFilter"
      rows-per-page-label="Budgets per page:"
      :pagination.sync="pagination"
      dense
      @update:pagination="
        $q.localStorage.set('summaryTableRows', $event.rowsPerPage)
      "
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">
          Categories
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
                      >Categories</q-item-label
                    >
                    <q-item-label caption>
                      Categories are the Budget Categories included in your
                      Budget for Summer Projects Nations. Summer Projects
                      National will create these for you, so you don't need to
                      add, delete, edit them. They do however provide a helpful
                      summary of the status of finances within your Project.
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-icon>
        </div>

        <q-space />

        <q-input
          borderless
          dense
          debounce="300"
          v-model="summaryFilter"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <sp-category-import />
        <q-btn
          flat
          round
          dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold">
          <q-td key="label" :props="props" class="cursor-pointer" auto-width>
            {{ props.row.label }}
            <q-popup-edit v-model="props.row.label">
              <q-input
                :value="props.row.label > '' ? props.row.label : ''"
                @input="updateCategory(props.row.id, 'label', $event)"
                dense
                autofocus
                label="Budget Label"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
            >
              <q-icon name="edit" />Edit
            </q-tooltip>
            <q-badge
              v-if="props.row.transAwaitingReview > 0"
              class="bg-red-8"
              :label="
                props.row.transAwaitingReview
                  ? props.row.transAwaitingReview
                  : ''
              "
              floating
            />
          </q-td>
          <q-td key="budgeted" :props="props">
            <!-- {{props.row.budget}} -->
            ${{ props.row.budget.toFixed(2) }}
          </q-td>
          <q-td
            key="spent"
            :props="props"
            :class="{
              'text-negative':
                parseFloat(props.row.budget) - parseFloat(props.row.expenses) <
                0
            }"
          >
            ${{ props.row.expenses.toFixed(2) }}
          </q-td>
          <q-td key="remaining" :props="props">
            <q-badge
              :class="{
                'bg-green-8': (props.row.balance ? props.row.balance : 0) > 0,
                'bg-red-8': (props.row.balance ? props.row.balance : 0) < 0,
                'bg-black': (props.row.balance ? props.row.balance : 0) == 0
              }"
              :label="
                '$' + (props.row.balance ? props.row.balance : 0).toFixed(2)
              "
            />
          </q-td>
          <!-- <q-td key="awaitingReviews" :props="props">
            {{
              props.row.transAwaitingReview ? props.row.transAwaitingReview : ''
            }}
          </q-td> -->
          <q-td key="actions" :props="props">
            <q-btn :to="'budget/' + props.row.id" dense class="q-mr-sm"
              >Budgets</q-btn
            >
            <q-btn :to="'transactions/' + props.row.id" dense class="q-mr-sm"
              >Transactions</q-btn
            >
            <q-btn v-if="props.row.inUse" dense color="negative">
              <q-icon name="delete_forever" />
              <q-tooltip content-class="bg-accent text-black"
                >Cannot Delete Budget while in use</q-tooltip
              >
            </q-btn>
            <sp-delete-btn
              dense
              v-if="!props.row.inUse"
              :docRef="`/projects/${project.id}/accounts/${props.row.id}`"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="fabPos" style="z-index:100">
      <q-btn
        fab
        icon="add"
        color="primary"
        direction="up"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-tooltip content-class="bg-accent text-black">Add Account</q-tooltip>
        <q-menu ref="addCategoryMenu" persistent>
          <!-- <q-scroll-area> -->
          <sp-budget-form
            :projectId="$route.params.id"
            @onSubmit="$refs.addCategoryMenu.hide()"
            show="category"
          />
          <!-- </q-scroll-area> -->
        </q-menu>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { debounce } from 'quasar'
import { $firestore, $analytics, $perform } from './../scripts/firebase.js'

const columns = [
  {
    name: 'label',
    align: 'left',
    label: 'Label',
    field: 'label',
    sortable: true
  },
  {
    name: 'budgeted',
    align: 'center',
    label: 'Budgeted (AUD)',
    field: 'budgeted',
    sortable: true
  },
  {
    name: 'spent',
    align: 'center',
    label: 'Spent (AUD)',
    field: 'spent',
    sortable: true
  },
  {
    name: 'remaining',
    align: 'center',
    label: 'Cash in Hand (AUD)',
    field: 'remaining',
    sortable: true
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

const accountColumns = [
  {
    name: 'label',
    align: 'left',
    label: 'Label',
    field: 'label',
    sortable: true
  },
  {
    name: 'balance',
    align: 'center',
    label: 'Balance (AUD)',
    field: 'balance',
    sortable: true
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

export default {
  data() {
    return {
      columns,
      accountColumns,
      summaryFilter: '',
      accountsFilter: '',
      visibleColumns: ['label', 'budgeted', 'spent', 'remaining', 'actions'],
      accountsVisibleColumns: [
        'label',
        'budgeted',
        'spent',
        'remaining',
        'actions'
      ],
      pagination: {
        sortBy: 'label',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      accountsPagination: {
        sortBy: 'label',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      fabPos: [18, 18],
      draggingFab: false
    }
  },
  preFetch({ store, currentRoute }) {
    // store.dispatch('fetchBudgets', currentRoute.params.id)
    // store.dispatch('fetchBudgetCategories', currentRoute.params.id)
    // store.dispatch('fetchAccounts', currentRoute.params.id)
  },
  created() {
    this.updateCategory = debounce(this.updateCategory, 1000)
    this.updateAccount = debounce(this.updateAccount, 1000)
    this.updateProject = debounce(this.updateProject, 3000)
    this.pagination.rowsPerPage = this.$q.localStorage.getItem(
      'summaryTableRows'
    )
    this.accountsPagination.rowsPerPage = this.$q.localStorage.getItem(
      'accountsTableRows'
    )
    $analytics.setCurrentScreen('Summary')
  },
  methods: {
    ...mapActions([
      'updateCategoryByKey',
      'updateAccountByKey',
      'updateProjectByKey'
    ]),
    moveFab(ev) {
      this.draggingFab = ev.isFirst !== true && ev.isFinal !== true

      this.fabPos = [this.fabPos[0] + ev.delta.x, this.fabPos[1] - ev.delta.y]
    },
    updateCategory(budgetId, key, val) {
      // console.log(budgetId, key, val)
      this.updateCategoryByKey({ budgetId, key, val })
      $firestore
        .collection(`/projects/${this.project.id}/accounts`)
        .doc(budgetId)
        .update({ [key]: val })
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Category: Updated Successfully'
          })
        })
        .catch(err => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
    },
    updateAccount(accountId, key, val) {
      // console.log(budgetId, key, val)
      this.updateAccountByKey({ accountId, key, val })
      $firestore
        .collection(`/projects/${this.project.id}/accounts`)
        .doc(accountId)
        .update({ [key]: val })
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Account: Updated Successfully'
          })
        })
        .catch(err => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
    },
    updateProject(key, val) {
      this.updateProjectByKey({ projectId: this.project.id, key, val })
      $firestore
        .doc(`/projects/${this.project.id}`)
        .update({ [key]: val })
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Project: Updated Successfully'
          })
        })
        .catch(err => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
    }
  },
  computed: {
    ...mapGetters(['project', 'budgetCategories', 'accounts', 'tableKey']),
    budgetCategoriesFiltered() {
      let budgetCategories = []
      for (var category in this.budgetCategories) {
        // console.log(category)
        budgetCategories.push(this.budgetCategories[category])
      }
      return budgetCategories
    },
    accountsFiltered() {
      let accounts = []
      for (var account in this.accounts) {
        // console.log(category)
        accounts.push(this.accounts[account])
      }
      return accounts
    }
  },
  components: {
    'sp-budget-form': () => import('./../components/sp-budget-form.vue'),
    'sp-delete-btn': () => import('../components/sp-delete-btn.vue'),
    'sp-category-import': () => import('../components/sp-category-import.vue')
  }
}
</script>
