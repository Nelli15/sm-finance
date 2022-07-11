<template>
  <q-table
    class="my-sticky-header-table"
    :rows="budgetCategoriesFiltered"
    :columns="columns"
    title="Budget Categories"
    :rows-per-page-options="[5, 6, 7, 8, 9, 10, 15, 20, 50, 100]"
    row-key="id"
    :filter="summaryFilter"
    rows-per-page-label="Categories per page:"
    :pagination="pagination"
    dense
    @update:pagination="
      ($event) => {
        pagination = $event
        $q.localStorage.set('categoryPagination', $event)
      }
    "
  >
    <template v-slot:top="props">
      <div class="col-4 q-table__title">
        Categories
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
                    >Categories</q-item-label
                  >
                  <q-item-label caption>
                    Categories are the Budget Categories included in your Budget
                    for Summer Missions Nations. Summer Missions National will
                    create these for you, so you don't need to add, delete, edit
                    them. They do however provide a helpful summary of the
                    status of finances within your Project.
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
      <sp-category-import dense />
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
                updateCategory(props.row.id, 'label', $event)
              "
              dense
              autofocus
              label="Budget Label"
            />
          </q-popup-edit>
          <q-tooltip
            anchor="center right"
            self="center left"
            class="bg-cyan-2 text-black"
          >
            <q-icon name="edit" />Edit
          </q-tooltip>
          <q-badge
            v-if="props.row.transAwaitingReview > 0"
            class="bg-red-8"
            :label="
              props.row.transAwaitingReview ? props.row.transAwaitingReview : ''
            "
            floating
          />
        </q-td>
        <q-td key="budgeted" :props="props">
          <!-- {{props.row.budget}} -->
          {{ props.row.budget.format() }}
        </q-td>
        <q-td
          key="spent"
          :props="props"
          :class="{
            'text-negative':
              props.row.budget.subtract(props.row.expenses).value < 0,
          }"
        >
          {{ props.row.expenses.format() }}
        </q-td>
        <q-td key="remaining" :props="props">
          <q-badge
            :class="{
              'bg-green-8':
                (props.row.balance ? props.row.balance.value : 0) > 0,
              'bg-red-8': (props.row.balance ? props.row.balance.value : 0) < 0,
              'bg-black':
                (props.row.balance ? props.row.balance.value : 0) == 0,
            }"
            :label="props.row.balance ? props.row.balance.format() : 0"
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
            <q-tooltip class="bg-cyan-2 text-black"
              >Cannot delete Budget Category while in use</q-tooltip
            >
          </q-btn>
          <sp-delete-btn
            dense
            v-if="!props.row.inUse"
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
import { updateCategory } from './../scripts/accounts.js'
import { defineAsyncComponent } from 'vue'

const columns = [
  {
    name: 'label',
    align: 'left',
    label: 'Label',
    field: 'label',
    sortable: true,
  },
  {
    name: 'budgeted',
    align: 'center',
    label: 'Budgeted (AUD)',
    field: 'budgeted',
    sortable: true,
  },
  {
    name: 'spent',
    align: 'center',
    label: 'Spent (AUD)',
    field: 'spent',
    sortable: true,
  },
  {
    name: 'remaining',
    align: 'center',
    label: 'Cash in Hand (AUD)',
    field: 'remaining',
    sortable: true,
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
]

export default {
  data() {
    return {
      columns,
      summaryFilter: '',
      visibleColumns: ['label', 'budgeted', 'spent', 'remaining', 'actions'],
      pagination: {
        sortBy: 'label',
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
    }
  },
  created() {
    this.updateCategory = debounce(this.updateCategory, 1000)
    this.pagination = this.$q.localStorage.has('cateogryPagination')
      ? this.$q.localStorage.getItem('categoryPagination')
      : {
          sortBy: 'label',
          descending: false,
          page: 1,
          rowsPerPage: 10,
          // rowsNumber: xx if getting data from a server
        }
  },
  methods: {
    ...mapActions('budgets', ['updateCategoryByKey']),
    updateCategory(budgetId, key, val) {
      // console.log(budgetId, key, val)
      this.updateCategoryByKey({ budgetId, key, val })
      updateCategory(this.$route.params.id, budgetId, key, val)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Category: Updated Successfully',
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
    ...mapGetters('budgets', ['budgetCategories']),
    budgetCategoriesFiltered() {
      let budgetCategories = []
      for (var category in this.budgetCategories) {
        // console.log(category)
        budgetCategories.push(this.budgetCategories[category])
      }
      return budgetCategories
    },
  },
  components: {
    'sp-delete-btn': defineAsyncComponent(() =>
      import('../components/sp-delete-btn.vue')
    ),
    'sp-category-import': defineAsyncComponent(() =>
      import('../components/sp-category-import.vue')
    ),
  },
}
</script>
