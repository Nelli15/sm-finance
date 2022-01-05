<template>
    <q-table
      class="my-sticky-header-table"
      :rows="accountsFiltered"
      :columns="columns"
      title="Accounts"
      :rows-per-page-options="[5, 6, 7, 8, 9, 10, 15, 20, 50, 100]"
      row-key="id"
      :filter="filter"
      rows-per-page-label="Accounts per page:"
      :pagination="pagination"
      dense
      @update:pagination="
        ($event) => {
          pagination = $event
          $q.localStorage.set('accountsPagination', $event)
        }
      "
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">
          Accounts
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
          v-model="filter"
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
                :model-value="props.row.label > '' ? props.row.label : ''"
                @update:model-value="
                  updateAccount(props.row.id, 'label', $event)
                "
                dense
                autofocus
                label="Budget Label"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              class="bg-accent text-black"
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
                'bg-green-8': (props.row.balance ? props.row.balance.value : 0) > 0,
                'bg-red-8': (props.row.balance ? props.row.balance : 0) < 0,
                'bg-black': (props.row.balance ? props.row.balance : 0) == 0,
              }"
              :label="
                (props.row.balance ? props.row.balance.format() : '$0.00')
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
              :model-value="props.row.inHeader"
              @update:model-value="
                updateAccount(props.row.id, 'inHeader', $event)
              "
              icon="view_compact"
            >
              <q-tooltip class="bg-accent text-black">View in Header</q-tooltip>
            </q-toggle>
            <!-- <q-btn :to="'budget/'+props.row.id" dense class="q-mr-sm">Budgets</q-btn> -->
            <q-btn :to="'transactions/' + props.row.id" dense class="q-mr-sm"
              >Transactions</q-btn
            >
            <q-btn v-if="props.row.inUse" dense color="negative">
              <q-icon name="delete_forever" />
              <q-tooltip class="bg-accent text-black"
                >Cannot delete Account while in use</q-tooltip
              >
            </q-btn>
            <q-btn v-else-if="props.row.systemAccount" dense color="negative">
              <q-icon name="delete_forever" />
              <q-tooltip class="bg-accent text-black"
                >Cannot Delete System Accounts</q-tooltip
              >
            </q-btn>
            <sp-delete-btn
              dense
              v-else
              :docRef="`/projects/${$route.params.id}/accounts/${props.row.id}`"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { debounce } from 'quasar'
import { updateAccount } from './../scripts/accounts.js'
import { defineAsyncComponent } from 'vue'
import currency from 'currency.js'

const columns = [
  {
    name: 'label',
    align: 'left',
    label: 'Label',
    field: 'label',
    sortable: true,
  },
  {
    name: 'balance',
    align: 'center',
    label: 'Balance (AUD)',
    field: 'balance',
    sortable: true,
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
]

export default {
  data() {
    return {
      columns,
      filter: '',
      visibleColumns: [
        'label',
        'budgeted',
        'spent',
        'remaining',
        'actions',
      ],
      pagination: {
        sortBy: 'label',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        // rowsNumber: xx if getting data from a server
      },
    }
  },
  created() {
    this.currency = currency
    this.updateAccount = debounce(this.updateAccount, 1000)
    this.pagination = this.$q.localStorage.has('accountsPagination')
      ? this.$q.localStorage.getItem('accountsPagination')
      : {
          sortBy: 'label',
          descending: false,
          page: 1,
          rowsPerPage: 10,
          // rowsNumber: xx if getting data from a server
        }
  },
  methods: {
    ...mapActions('budgets', ['updateAccountByKey']),
    updateAccount(accountId, key, val) {
      // console.log(budgetId, key, val)
      this.updateAccountByKey({ accountId, key, val })
      updateAccount(this.$route.params.id, accountId, key, val)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Account: Updated Successfully',
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
  },
  computed: {
    ...mapGetters('budgets', ['accounts']),
    accountsFiltered() {
      let accounts = []
      for (var account in this.accounts) {
        // console.log(category)
        accounts.push(this.accounts[account])
      }
      return accounts
    },
  },
  components: {
    'sp-delete-btn': defineAsyncComponent(() =>
      import('../components/sp-delete-btn.vue')
    )
  },
}
</script>