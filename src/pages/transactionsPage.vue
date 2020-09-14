<template>
  <q-page padding>
    <!-- {{budgetCategories}} -->
    <!-- {{ budget }} -->
    <q-banner
      class="bg-info text-center q-mb-md"
      rounded
      v-if="budget && budget.type === 'budget'"
    >
      <span class="q-mr-lg">
        <b>Category:</b> {{ budgetCategories[budget.category].label }}
      </span>
      <span class="q-mr-lg"> <b>Budget:</b> {{ budget.label }} </span>
      <span class="q-mr-lg">
        <b>Budgeted:</b>
        <q-badge class="bg-black" :label="'$' + budget.budget.toFixed(2)" />
      </span>
      <span
        :class="{
          'text-negative':
            parseFloat(budget.budget) - parseFloat(budget.expenses) < 0
        }"
        class=" q-mr-lg"
      >
        <b>Spent:</b>
        <q-badge class="bg-red-8" :label="'$' + budget.expenses.toFixed(2)" />
      </span>
      <span class="q-mr-lg">
        <b>Cash in Hand:</b>
        <q-badge
          :class="{
            'bg-green-8': budget.income - budget.expenses > 0.01,
            'bg-red-8': budget.income - budget.expenses < -0.01,
            'bg-black':
              budget.income - budget.expenses < 0.01 &&
              budget.income - budget.expenses > -0.01
          }"
          :label="'$' + (budget.income - budget.expenses).toFixed(2)"
        />
      </span>
    </q-banner>
    <q-banner
      class="bg-secondary text-white text-center q-mb-md"
      rounded
      v-if="budget && budget.type === 'account'"
    >
      <span class="q-mr-lg"> <b>Account:</b> {{ budget.label }} </span>
      <span
        :class="{
          'text-negative':
            parseFloat(budget.budget) - parseFloat(budget.expenses) < 0
        }"
        class=" q-mr-lg"
      >
        <b>In:</b>
        <q-badge class="bg-black" :label="'$' + budget.income.toFixed(2)" />
      </span>
      <span
        :class="{
          'text-negative':
            parseFloat(budget.budget) - parseFloat(budget.expenses) < 0
        }"
        class=" q-mr-lg"
      >
        <b>Out:</b>
        <q-badge class="bg-red-8" :label="'$' + budget.expenses.toFixed(2)" />
      </span>
      <span class="q-mr-lg">
        <b>Balance:</b>
        <q-badge
          :class="{
            'bg-green-8': budget.income - budget.expenses > 0.01,
            'bg-red-8': budget.income - budget.expenses < -0.01,
            'bg-black':
              budget.income - budget.expenses < 0.01 &&
              budget.income - budget.expenses > -0.01
          }"
          :label="'$' + (budget.income - budget.expenses).toFixed(2)"
        />
      </span>
    </q-banner>
    <q-banner
      class="bg-secondary text-white text-center q-mb-md"
      rounded
      v-if="budget && budget.type === 'category'"
    >
      <span class="q-mr-lg"> <b>Category:</b> {{ budget.label }} </span>
      <span class="q-mr-lg">
        <b>Budgeted:</b>
        <q-badge class="bg-black" :label="'$' + budget.budget.toFixed(2)" />
      </span>
      <span
        :class="{
          'text-negative':
            parseFloat(budget.budget) - parseFloat(budget.expenses) < 0
        }"
        class=" q-mr-lg"
      >
        <b>Spent:</b>
        <q-badge class="bg-red-8" :label="'$' + budget.expenses.toFixed(2)" />
      </span>
      <span class="q-mr-lg">
        <b>Cash in Hand:</b>
        <q-badge
          :class="{
            'bg-green-8': budget.income - budget.expenses > 0.01,
            'bg-red-8': budget.income - budget.expenses < -0.01,
            'bg-black':
              budget.income - budget.expenses < 0.01 &&
              budget.income - budget.expenses > -0.01
          }"
          :label="'$' + (budget.income - budget.expenses).toFixed(2)"
        />
      </span>
    </q-banner>
    <q-table
      class="my-sticky-header-table"
      :data="transactionsFiltered"
      :columns="columns"
      :rows-per-page-options="[5, 10, 15, 20, 50, 100, 200]"
      :row-key="row => row.id"
      :visible-columns="visibleColumns"
      :filter="filter"
      :filter-method="filterMethod"
      rows-per-page-label="Transactions per page:"
      :pagination.sync="pagination"
      @update:pagination="
        $q.localStorage.set('transTableRows', $event.rowsPerPage)
      "
      selection="multiple"
      :selected.sync="rowSelected"
      dense
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">
          Transactions{{ pageLabel > '' ? ' for ' + pageLabel : '' }}
          <q-icon name="help_outline" size="xs" color="grey-7">
            <q-tooltip
              max-width="150px"
              anchor="center right"
              self="center left"
              content-class="bg-cyan-2 text-black"
            >
              Transactions record the transfer of money into, out of, and within
              a project. A transaction should be recorded each time money is
              moved. There are three types of transactions. <br />
              <b class="text-green-8">-Income (Green)</b>, records when a
              project recieves money from something, usually SP National<br />
              <b class="text-blue-8">-Journal (Blue)</b>, records money being
              moved amoungst accounts and budgets without leaving the
              project.<br />
              <b class="text-red-8">-Expense (Red)</b>, records money leaving
              the project. eg. buying groceries, or returning money to SP
              National
            </q-tooltip>
          </q-icon>
        </div>

        <q-space />

        <!-- <div v-if="$q.screen.gt.xs" class="col">
          <q-toggle v-for="column in columns" v-model="visibleColumns" :val="column.name" :label="column.label" :key="column.name" />
        </div>
 -->
        <q-select
          v-model="visibleColumns"
          multiple
          borderless
          dense
          options-dense
          :display-value="$q.lang.table.columns"
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

        <q-toggle v-model="showArchived" color="secondary" icon="archive">
          <q-tooltip
            anchor="center right"
            self="center left"
            content-class="bg-accent text-black"
          >
            Show Archived
          </q-tooltip>
        </q-toggle>
        <q-btn
          flat
          round
          dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th>
            <q-checkbox dense v-model="props.selected" />
          </q-th>
          <!-- {{columnsFiltered}} -->
          <q-th v-for="col in columnsFiltered" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr
          :props="props"
          class="text-bold"
          :class="{
            'bg-red-2': props.row.deleted,
            'bg-orange-2':
              props.row.deleteRequested &&
              !props.row.deleted &&
              !props.row.reviewed
          }"
        >
          <q-td key="selected" :props="props">
            <!-- {{props.selected}} -->
            <q-checkbox v-model="props.selected" dense />
          </q-td>
          <q-td key="submittedBy" :props="props">
            <q-avatar v-if="props.row.submittedBy" size="md">
              <!-- <img
                :src="
                  props.row.submittedBy.photoURL
                    ? props.row.submittedBy.photoURL
                    : 'http://tinygraphs.com/spaceinvaders/' +
                      props.row.submittedBy.uid +
                      '?theme=bythepool&numcolors=4&size=220&fmt=svg'
                "
              /> -->
              <q-img
                :src="
                  props.row.submittedBy.photoURL
                    ? props.row.submittedBy.photoURL
                    : 'https://api.adorable.io/avatars/100/' +
                      props.row.submittedBy.uid +
                      '?theme=bythepool&numcolors=4&size=220&fmt=svg'
                "
                alt="Profile Picture"
              >
                <template v-slot:error>
                  <q-img
                    :src="
                      'https://api.adorable.io/avatars/100/' +
                        props.row.submittedBy.uid +
                        '?theme=bythepool&numcolors=4&size=220&fmt=svg'
                    "
                    alt="Profile Picture"
                  >
                    <template v-slot:error>
                      <div
                        class="absolute-full flex flex-center bg-negative text-white"
                      >
                        Cannot load image
                      </div>
                    </template>
                  </q-img>
                </template>
              </q-img>
              <div v-show="false">
                {{ props.row.submittedBy.displayName
                }}{{ props.row.submittedBy.email }}
              </div>
              <q-tooltip content-class="bg-accent text-black">
                <b>{{ props.row.submittedBy.displayName }}</b
                ><br />{{ props.row.submittedBy.email }}
                <div
                  v-if="
                    props.row.deleteRequested &&
                      !props.row.deleted &&
                      !props.row.reviewed
                  "
                  class="text-negative"
                >
                  "{{ props.row.submittedBy.displayName }} requested this be
                  deleted"
                </div>
              </q-tooltip>
              <q-badge
                v-if="
                  props.row.deleteRequested &&
                    !props.row.deleted &&
                    !props.row.reviewed
                "
                floating
                color="negative"
                dense
                style="border-radius: 10px;
    height: 12px;"
              ></q-badge>
            </q-avatar>
          </q-td>
          <q-td key="number" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="icon" :props="props" class="cursor-pointer">
            <!-- {{props.row.type}} -->
            <q-icon
              v-if="props.row.type === 'Cheque'"
              name="mdi-checkbook"
              size="md"
            >
              <q-tooltip>
                Cheque
              </q-tooltip>
            </q-icon>
            <q-icon v-if="props.row.type === 'Cash'" name="mdi-cash" size="md">
              <q-tooltip>
                Cash
              </q-tooltip>
            </q-icon>
            <q-icon
              v-if="props.row.type === 'Internet Transfer'"
              name="mdi-bank-transfer"
              size="md"
            >
              <q-tooltip>
                Internet Transfer
              </q-tooltip>
            </q-icon>
            <q-icon
              v-if="props.row.type === 'Bank Card'"
              name="mdi-credit-card"
              size="md"
            >
              <q-tooltip>
                Bank Card
              </q-tooltip>
            </q-icon>
            <q-popup-edit v-model="props.row.type">
              <q-select
                :value="props.row.type"
                dense
                label="Type"
                :options="typeOptions"
                @input="updateTransaction(props.row.id, 'type', $event)"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
            >
              <q-icon name="edit" />
              Edit
            </q-tooltip>
          </q-td>
          <q-td key="category" :props="props">
            <!-- {{props.row.category}} -->
            <!-- {{budgets[props.row.category].category}} -->
            <!-- {{ props.row.id }} -->
            <div v-if="props.row.category !== 'Journal'">
              {{
                props.row.category !== 'Journal'
                  ? getCategoryById(props.row.budget)
                  : ''
              }}
            </div>
          </q-td>
          <q-td key="budget" :props="props" class="cursor-pointer">
            <!-- {{ props.row.text }} -->
            <div v-if="props.row.category === 'Expense'">
              {{
                budgets[props.row.budget]
                  ? budgets[props.row.budget].label
                  : accounts[props.row.budget]
                  ? accounts[props.row.budget].label
                  : ''
              }}
              <q-popup-edit v-model="props.row.budget">
                <q-select
                  :value="
                    budgets[props.row.budget] > ''
                      ? budgets[props.row.budget].label
                      : ''
                  "
                  @input="updateTransaction(props.row.id, 'budget', $event.id)"
                  dense
                  autofocus
                  label="Budget"
                  :options="budgetOptions"
                />
              </q-popup-edit>
              <q-tooltip
                anchor="center right"
                self="center left"
                content-class="bg-accent text-black"
              >
                <q-icon name="edit" />
                Edit
              </q-tooltip>
            </div>
            <div v-if="props.row.category === 'Income'">
              <!-- {{ props.row.budget }} -->
              {{
                budgets[props.row.budget]
                  ? budgets[props.row.budget].label
                  : accounts[props.row.budget]
                  ? accounts[props.row.budget].label
                  : ''
              }}
              <q-popup-edit v-model="props.row.budget">
                <q-select
                  :value="
                    budgets[props.row.budget] > ''
                      ? budgets[props.row.budget].label
                      : ''
                  "
                  @input="updateTransaction(props.row.id, 'budget', $event.id)"
                  dense
                  autofocus
                  label="Budget"
                  :options="budgetOptions"
                />
              </q-popup-edit>
              <q-tooltip
                anchor="center right"
                self="center left"
                content-class="bg-accent text-black"
              >
                <q-icon name="edit" />
                Edit
              </q-tooltip>
            </div>
            <div v-if="props.row.category === 'Journal'" class="cursor-pointer">
              {{
                accounts[props.row.from] ? accounts[props.row.from].label : ''
              }}
              {{
                budgetCategories[props.row.from]
                  ? budgetCategories[props.row.from].label
                  : ''
              }}
              {{ budgets[props.row.from] ? budgets[props.row.from].label : '' }}
              <q-icon
                name="arrow_forward"
                v-if="props.row.category === 'Journal'"
              />
              {{ accounts[props.row.to] ? accounts[props.row.to].label : '' }}
              {{
                budgetCategories[props.row.to]
                  ? budgetCategories[props.row.to].label
                  : ''
              }}
              {{ budgets[props.row.to] ? budgets[props.row.to].label : '' }}
              <q-popup-edit v-model="props.row.from">
                <q-select
                  v-if="accounts[props.row.from]"
                  :value="accounts[props.row.from].label"
                  @input="updateTransaction(props.row.id, 'from', $event.id)"
                  dense
                  autofocus
                  label="From"
                  stack-label
                  :options="budgetOptions"
                />
                <q-select
                  v-if="budgets[props.row.from]"
                  :value="budgets[props.row.from].label"
                  @input="updateTransaction(props.row.id, 'from', $event.id)"
                  dense
                  autofocus
                  label="From"
                  stack-label
                  :options="budgetOptions"
                />
                <q-select
                  v-if="budgetCategories[props.row.from]"
                  :value="budgetCategories[props.row.from].label"
                  @input="updateTransaction(props.row.id, 'from', $event.id)"
                  dense
                  autofocus
                  label="From"
                  stack-label
                  :options="budgetOptions"
                />
                <q-select
                  v-if="accounts[props.row.to]"
                  :value="accounts[props.row.to].label"
                  @input="updateTransaction(props.row.id, 'to', $event.id)"
                  dense
                  autofocus
                  label="To"
                  stack-label
                  :options="budgetOptions"
                />
                <q-select
                  v-if="budgets[props.row.to]"
                  :value="budgets[props.row.to].label"
                  @input="updateTransaction(props.row.id, 'to', $event.id)"
                  dense
                  autofocus
                  label="To"
                  stack-label
                  :options="budgetOptions"
                />
                <q-select
                  v-if="budgetCategories[props.row.to]"
                  :value="budgetCategories[props.row.to].label"
                  @input="updateTransaction(props.row.id, 'to', $event.id)"
                  dense
                  autofocus
                  label="To"
                  stack-label
                  :options="budgetOptions"
                />
              </q-popup-edit>
              <q-tooltip
                anchor="center right"
                self="center left"
                content-class="bg-accent text-black"
              >
                <q-icon name="edit" />
                Edit
              </q-tooltip>
            </div>
          </q-td>
          <q-td key="date" :props="props" class="cursor-pointer">
            {{ props.row.date }}
            <q-popup-edit v-model="props.row.date">
              <!-- <q-date
                v-model="props.row.date"
                dense
                minimal
                label="Date"
              /> -->
              <q-date
                :value="props.row.date"
                @input="updateTransaction(props.row.id, 'date', $event)"
                mask="DD/MM/YYYY"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
            >
              <q-icon name="edit" />
              Edit
            </q-tooltip>
          </q-td>
          <q-td
            key="amount"
            :props="props"
            :class="{
              'text-red-8': props.row.category === 'Expense',
              'text-green-8': props.row.category === 'Income',
              'text-blue-8': props.row.category === 'Journal'
            }"
            class="cursor-pointer"
          >
            <!-- {{ getAmount(props.row.text) }} -->
            <!-- {{props.row}} -->
            {{ parseFloat(props.row.amount).toFixed(2) }}
            <q-popup-edit v-model="props.row.amount">
              <q-input
                :value="props.row.amount"
                @input="updateTransaction(props.row.id, 'amount', $event)"
                dense
                autofocus
                :label="'Amount (' + project.currency + ')'"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
            >
              <q-icon name="edit" />
              Edit
            </q-tooltip>
          </q-td>
          <q-td
            key="GST"
            :props="props"
            :class="{ 'cursor-pointer': props.row.category !== 'Journal' }"
          >
            <!-- {{ getGST(props.row.text) }} -->
            {{ parseFloat(props.row.GST ? props.row.GST : 0).toFixed(2) }}
            <q-popup-edit
              v-model="props.row.GST"
              v-if="props.row.category !== 'Journal'"
            >
              <q-input
                :value="props.row.GST"
                @input="updateTransaction(props.row.id, 'GST', $event)"
                dense
                autofocus
                label="GST"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
              v-if="props.row.category !== 'Journal'"
            >
              <q-icon name="edit" />
              Edit
            </q-tooltip>
          </q-td>
          <q-td
            key="desc"
            :props="props"
            class="cursor-pointer"
            style="white-space: normal;min-width:300px"
          >
            {{ props.row.desc }}
            <q-popup-edit v-model="props.row.desc">
              <q-input
                :value="props.row.desc"
                @input="updateTransaction(props.row.id, 'desc', $event)"
                dense
                autofocus
                label="Description"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
            >
              <q-icon name="edit" />
              Edit
            </q-tooltip>
          </q-td>
          <q-td
            key="cheque"
            :props="props"
            class="{ 'cursor-pointer': props.row.type === 'Cheque' }"
          >
            {{ props.row.cheque }}
            <q-popup-edit
              v-model="props.row.cheque"
              v-if="props.row.type === 'Cheque'"
            >
              <q-input
                :value="props.row.cheque"
                @input="updateTransaction(props.row.id, 'cheque', $event)"
                dense
                autofocus
                label="Cheque #"
              />
            </q-popup-edit>
            <q-tooltip
              anchor="center right"
              self="center left"
              content-class="bg-accent text-black"
              v-if="props.row.type === 'Cheque'"
            >
              <q-icon name="edit" />
              Edit
            </q-tooltip>
          </q-td>
          <!-- <q-td key="reviewed" :props="props"> -->
          <!-- {{props.row.deleted}} -->
          <!-- <q-checkbox :value="props.row.reviewed" @input="updateTransaction(props.row.id, 'reviewed', $event)" /> -->
          <!-- </q-td> -->
          <!-- <q-td key="receipt" :props="props"> -->
          <!-- <a :href="props.row.receipt">Receipt</a> -->
          <!-- {{getReceipt('the-speaker-grill-small')}} -->
          <!-- <q-inner-loading :showing="!props.row.receiptURL"> -->
          <!-- </q-inner-loading> -->
          <!-- {{props.row.receiptURL.startsWith('https://')}} -->
          <!-- </q-td> -->
          <q-td key="actions" :props="props" auto-width>
            <sp-receipt
              :id="props.row.id"
              :label="props.row.id"
              :url="props.row.receiptURL"
              v-if="
                props.row.receiptURL > ''
                  ? props.row.receiptURL.startsWith('https://')
                  : false
              "
              class="q-mr-sm"
            />
            <q-icon
              name="img:../icons/no-receipt.png"
              style="height:30px;width:30px;padding:3.99px"
              v-if="
                props.row.receiptURL > ''
                  ? !props.row.receiptURL.startsWith('https://')
                  : true
              "
              class="q-mr-sm"
            />
            <q-spinner-gears
              size="30px"
              color="primary"
              v-if="!props.row.receiptURL && props.row.receipt"
            >
              <q-tooltip
                anchor="center right"
                self="center left"
                content-class="bg-accent text-black"
              >
                Checking for receipt
              </q-tooltip>
            </q-spinner-gears>
            <q-btn
              icon="check"
              round
              :color="props.row.reviewed ? 'positive' : ''"
              @click="
                updateTransaction(props.row.id, 'reviewed', !props.row.reviewed)
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
                Reviewed?
              </q-tooltip>
            </q-btn>
            <q-btn
              :value="props.row.deleted ? props.row.deleted : false"
              @click="
                updateTransaction(props.row.id, 'deleted', !props.row.deleted)
              "
              :icon="props.row.deleted ? 'unarchive' : 'archive'"
              dense
              class="q-mr-sm"
            >
              <q-tooltip
                anchor="center right"
                self="center left"
                content-class="bg-accent text-black"
              >
                {{ props.row.deleted ? 'Unarchive' : 'Archive' }}
              </q-tooltip>
            </q-btn>
            <!-- {{props.row.deleted}} -->
            <sp-delete-btn
              dense
              :docRef="`/projects/${project.id}/transactions/${props.row.id}`"
              class="q-mr-sm"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky
      position="bottom-left"
      :offset="[18, 18]"
      style="z-index:100"
    >
      <q-btn fab icon="add" color="primary">
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Transaction
        </q-tooltip>
        <q-menu ref="addTransMenu" persistent>
          <!-- <q-scroll-area> -->
          <sp-trans-form
            :projectId="project.id"
            @onSubmit="$refs.addTransMenu.hide()"
          />
          <!-- </q-scroll-area> -->
        </q-menu>
      </q-btn>
    </q-page-sticky>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      style="z-index:100"
      v-if="rowSelected.length > 0"
    >
      <q-card class="bg-primary text-white">
        <q-card-section>
          Amount ({{ project.currency }}): ${{ calcSelected }}
          <q-tooltip content-class="bg-accent text-grey-10">
            Sum of Selected
          </q-tooltip>
        </q-card-section>
      </q-card>
    </q-page-sticky>
    <div style="min-height:60px" />
  </q-page>
</template>

<script>
import { debounce } from 'quasar'
import firebase from 'firebase/app'
require('firebase/firestore')

import { mapGetters, mapActions } from 'vuex'

var cc = require('currency-codes')

export default {
  data() {
    return {
      columns: [
        {
          name: 'selected',
          label: '',
          field: 'selected',
          align: 'left',
          sortable: true
        },
        {
          name: 'submittedBy',
          label: 'From',
          field: 'submittedBy',
          align: 'left',
          sortable: true
        },
        {
          name: 'number',
          label: 'Transaction ID',
          field: 'number',
          align: 'center',
          sortable: true
        },
        { name: 'icon', label: 'Type', field: 'icon', align: 'center' },
        {
          name: 'category',
          label: 'Category',
          field: 'category',
          align: 'left',
          sortable: true
        },
        {
          name: 'budget',
          label: 'Account',
          field: 'budget',
          align: 'left',
          sortable: true
        },
        {
          name: 'date',
          label: 'Date',
          field: 'date',
          align: 'center',
          sortable: true
        },
        {
          name: 'amount',
          label: `Amount (currency)`,
          field: 'amount',
          align: 'center',
          sortable: true
        },
        {
          name: 'GST',
          label: `GST (currency)`,
          field: 'GST',
          align: 'center',
          sortable: true
        },
        {
          name: 'desc',
          label: 'Description',
          field: 'desc',
          align: 'center',
          sortable: true
        },
        {
          name: 'cheque',
          label: 'Cheque #',
          field: 'cheque',
          align: 'center',
          sortable: true
        },
        // { name: 'reviewed', label: 'Reviewed', field: 'reviewed', align: 'center', sortable: true },
        // { name: 'receipt', label: 'Receipt', field: 'receipt', align: 'center' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
      ],
      filter: '',
      ccOptions: [],
      visibleColumns: [
        'selected',
        'submittedBy',
        'icon',
        'date',
        'amount',
        'GST',
        'type',
        'category',
        'budget',
        'desc',
        'actions'
      ],
      pagination: {
        sortBy: 'date',
        descending: true,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      rowSelected: [],
      showArchived: false,
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']
    }
  },
  created() {
    // console.log(this.project.currency)
    // this.$store.dispatch('fetchProject', { projectId: this.$route.params.id, uid: this.user.uid })

    this.$store.dispatch('fetchBudgetCategories', this.$route.params.id)
    this.$store.dispatch('fetchBudgets', this.$route.params.id)
    this.$store.dispatch('fetchAccounts', this.$route.params.id)
    // this.$store.dispatch('fetchContributors', this.$route.params.id)
    // this.$store.dispatch('fetchInvites', this.$route.params.id)
    this.$store.dispatch('fetchTransactions', this.$route.params.id)
    if (this.project.currency) {
      for (var key in this.columns) {
        if (this.columns[key].label.search('(currency)') !== -1) {
          this.columns[key].label = this.columns[key].label.replace(
            '(currency)',
            `(${this.project.currency})`
          )
        }
      }
    }

    this.updateTransaction = debounce(this.updateTransaction, 1000)
    this.pagination.rowsPerPage = this.$q.localStorage.getItem('transTableRows')
  },
  methods: {
    ...mapActions(['updateTransactionByKey']),
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.ccOptions = cc.codes()
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.ccOptions = cc
          .codes()
          .filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    getCategoryById(id) {
      if (this.budgets[id]) {
        return this.budgetCategories[this.budgets[id].category].label
      } else if (this.budgetCategories[id]) {
        return this.budgetCategories[id].label
      } else {
        return ''
      }
    },
    getAmount(text) {
      if (text > '') {
        let totalFound = false
        // let amountFound
        let textArray = text
          .split('\n')
          .join(' ')
          .split(' ')
        // console.log(textArray.length)
        for (var key in textArray) {
          // console.log(key, textArray[key].toLowerCase())
          if (
            textArray[key].toLowerCase().indexOf('total') !== -1 &&
            !(textArray[key].toLowerCase().indexOf('subtotal') !== -1)
          ) {
            // console.log(key + 1)
            totalFound = true
            // console.log(textArray[key] + textArray[(parseInt(key) + 1)] + textArray[(parseInt(key) + 2)])
          }
          if (totalFound && textArray[key].indexOf('$') !== -1) {
            return parseFloat(textArray[key].split('$').join(''))
          }
        }
      }
    },
    getGST(text) {
      // if (text > '') {
      //   // let totalFound = false
      //   // let amountFound
      //   let textArray = text.split('\n').join(' ').split(' ')
      //   // console.log(textArray.length)
      //   for (var key in textArray) {
      //     // console.log(key, textArray[key].toLowerCase())
      //     // if ((textArray[key].toLowerCase().indexOf('gst') !== -1) || (textArray[key].toLowerCase().indexOf('tax') !== -1)) {
      //     //   // console.log(key + 1)
      //     //   totalFound = true
      //     //   // console.log(textArray[key] + textArray[(parseInt(key) + 1)] + textArray[(parseInt(key) + 2)])
      //     // }
      //     // if ((totalFound || !totalFound) && textArray[key].indexOf('$') !== -1) {
      //       // console.log(key, textArray[key].toLowerCase())
      //       // return parseFloat(textArray[key].split('$').join(''))
      //     // }
      //   }
      // }
    },
    updateTransaction(trans, key, val) {
      // console.log(trans, key, val)
      // console.log(parseFloat(this.transactions[this.transactions.findIndex(x => x.id === trans)].amount) * 0.1, parseFloat(val), (parseFloat(val) <= (parseFloat(this.transactions[this.transactions.findIndex(x => x.id === trans)].amount) * 0.1)))
      if (
        key === 'GST' &&
        parseFloat(val) >
          parseFloat(
            this.transactions[this.transactions.findIndex(x => x.id === trans)]
              .amount
          ) *
            0.1
      ) {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: 'GST must be <= Amount'
        })
        return
      }

      this.updateTransactionByKey({ trans, key, val })
      firebase
        .firestore()
        .collection(`/projects/${this.project.id}/transactions`)
        .doc(trans)
        .update({ [key]: val })
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Transaction: Updated Successfully'
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
    filterMethod(rows, terms, cols, cellValue) {
      const lowerTerms = terms ? terms.toLowerCase() : ''
      let res = rows.filter(row =>
        cols.some(col =>
          typeof cellValue(col, row) === 'object'
            ? (Object.values(cellValue(col, row)) + '')
                .toLowerCase()
                .indexOf(lowerTerms) > -1
            : (cellValue(col, row) + '').toLowerCase().indexOf(lowerTerms) !==
              -1
        )
      )
      return res
    }
  },
  computed: {
    ...mapGetters([
      'project',
      'idToken',
      'transactions',
      'accounts',
      'budgets',
      'budgetOptions',
      'budgetCategories'
    ]),
    columnsFiltered() {
      let columns = []
      for (var key in this.columns) {
        if (this.columns[key].name !== 'selected') {
          columns.push(this.columns[key])
        }
      }
      return columns
    },
    transactionsFiltered() {
      let transactions = []
      // check if the budget filter exists
      if (this.$route.params.budgetCategory) {
        let budgets = []
        // check if the filter is a category
        if (this.budgetCategories[this.$route.params.budgetCategory]) {
          // the filter is a category
          // find all budgets in the category
          for (var key in this.budgets) {
            // check if the category
            if (
              this.budgets[key].category === this.$route.params.budgetCategory
            ) {
              // console.log('Pushing', key)
              // add the budget to the array of budgets
              budgets.push(key)
            }
          }
        } else if (this.accounts[this.$route.params.budgetCategory]) {
          // the filter is an account
          // find all transactions in the account
          for (var transKey in this.transactions) {
            // check if the transaction exists in the budgets array
            console.log(
              !this.transactions[transKey].deleted ||
                (this.transactions[transKey].deleted && this.showArchived)
            )
            if (
              !this.transactions[transKey].deleted ||
              (this.transactions[transKey].deleted && this.showArchived)
            ) {
              // check it's not archieved and if it is archieve check if the archive is showing
              console.log(
                this.transactions[transKey],
                this.$route.params.budgetCategory ===
                  this.transactions[transKey].budget,
                this.$route.params.budgetCategory ===
                  this.transactions[transKey].to,
                this.$route.params.budgetCategory ===
                  this.transactions[transKey].from
              )
              if (
                (this.$route.params.budgetCategory ===
                  this.transactions[transKey].budget &&
                  this.transactions[transKey].category !== 'Journal') ||
                (this.$route.params.budgetCategory ===
                  this.transactions[transKey].to &&
                  this.transactions[transKey].category === 'Journal') ||
                (this.$route.params.budgetCategory ===
                  this.transactions[transKey].from &&
                  this.transactions[transKey].category === 'Journal')
              ) {
                // add the transactions to the transaction array
                transactions.push(this.transactions[transKey])
              }
            }
          }
          return transactions
        } else {
          // the filter is not a category
          // add the budget to the array of budgets
          budgets = [this.$route.params.budgetCategory]
        }

        // find all transactions in the budgets
        for (transKey in this.transactions) {
          // check if the transaction exists in the budgets array
          // if (budgets.includes(this.transactions[transKey].budget)) {
          //   // check it's not archieved and if it is archieve check if the archive is showing
          //   if (!this.transactions[transKey].deleted || (this.transactions[transKey].deleted && this.showArchived)) {
          //     // add the transactions to the transaction array
          //     transactions.push(this.transactions[transKey])
          //   }
          // }
          // console.log(!this.transactions[transKey].deleted || (this.transactions[transKey].deleted && this.showArchived))
          if (
            !this.transactions[transKey].deleted ||
            (this.transactions[transKey].deleted && this.showArchived)
          ) {
            // check it's not archieved and if it is archieve check if the archive is showing
            // console.log(this.transactions[transKey], (this.$route.params.budgetCategory === this.transactions[transKey].budget), (this.$route.params.budgetCategory === this.transactions[transKey].to), (this.$route.params.budgetCategory === this.transactions[transKey].from))
            if (
              (budgets.includes(this.transactions[transKey].budget) &&
                this.transactions[transKey].category !== 'Journal') ||
              (budgets.includes(this.transactions[transKey].to) &&
                this.transactions[transKey].category === 'Journal') ||
              (budgets.includes(this.transactions[transKey].from) &&
                this.transactions[transKey].category === 'Journal')
            ) {
              // add the transactions to the transaction array
              transactions.push(this.transactions[transKey])
            }
          }
        }
      } else {
        // find all transactions in the budgets
        for (transKey in this.transactions) {
          // check it's not archieved and if it is archieve check if the archive is showing
          // console.log(this.transactions[transKey].id, !this.transactions[transKey].deleted, , this.showArchived)
          if (
            !this.transactions[transKey].deleted ||
            (this.transactions[transKey].deleted && this.showArchived)
          ) {
            // add the transactions to the transaction array
            transactions.push(this.transactions[transKey])
          }
        }
      }
      return transactions
    },
    calcSelected() {
      let total = 0
      for (var key in this.rowSelected) {
        // console.log(parseFloat(this.rowSelected[key].amount))
        total += parseFloat(this.rowSelected[key].amount)
      }
      return total.toFixed(2)
    },
    pageLabel() {
      let category = this.$route.params.budgetCategory
      return category > ''
        ? this.budgets[category]
          ? this.budgets[category].label
          : this.budgetCategories[category]
          ? this.budgetCategories[category].label
          : this.accounts[category]
          ? this.accounts[category].label
          : ''
        : ''
    },
    budget() {
      if (this.$route.params.budgetCategory) {
        if (this.budgetCategories[this.$route.params.budgetCategory]) {
          return this.budgetCategories[this.$route.params.budgetCategory]
        } else if (this.accounts[this.$route.params.budgetCategory]) {
          return this.accounts[this.$route.params.budgetCategory]
        } else {
          return this.budgets[this.$route.params.budgetCategory]
        }
      } else {
        return false
      }
    }
  },
  watch: {
    project(oldVal, newVal) {
      // console.log(this.project.currency)
      for (var key in this.columns) {
        if (this.columns[key].label.search('(currency)') !== -1) {
          this.columns[key].label = this.columns[key].label.replace(
            '(currency)',
            `(${this.project.currency})`
          )
        }
      }
    }
  },
  components: {
    'sp-trans-form': () => import('../components/sp-trans-form.vue'),
    'sp-receipt': () => import('../components/sp-receipt.vue'),
    'sp-delete-btn': () => import('../components/sp-delete-btn.vue')
  }
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
