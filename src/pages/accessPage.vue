<template>
  <q-page padding>
    <q-tabs
      v-model="tabs"
    >
      <q-tab name="invites" label="Invite" />
      <q-tab name="admins" label="Admins" />
      <q-tab name="contributors" label="Contributors" />
    </q-tabs>
    <q-card v-show="$q.platform.is.mobile && tabs === 'invites'">
      <q-card-section>
        <div class="text-subtitle2">Invite People</div>
          <q-form @submit="addUser">
            <q-input v-model="newInvitation.email" type="email" label="Email" stack-label />
            <q-select v-if="isAdmin" v-model="newInvitation.permission" placeholder="Permission" :options="['contributor','admin']"  label="Permission" stack-label style="min-width:100px" />
            <q-select v-if="isAdmin && newInvitation.permission === 'contributor'" value="" @input="addNewInviteBudget" :options="budgetOptions" label="Budgets" stack-label style="min-width:100px" />
            <div v-if="newInvitation.permission === 'contributor'">Accessible Budgets</div>
            <div v-if="newInvitation.permission === 'contributor'" class="q-gutter-xs">
              <q-chip color="primary" text-color="white" dense square v-for="budget in newInvitation.budgets" :key="'budget-'+budget" removable @remove="removeNewInviteBudget(budget)">
                {{ budgets[budget] ? budgets[budget].label : budgetCategories[budget] ? budgetCategories[budget].label : accounts[budget].label }}
              </q-chip>
            </div>
            <q-btn dense title="Send Invitation" icon="send" color="positive" type="submit" class="q-mt-md" />
        </q-form>
      </q-card-section>
    </q-card>
    <q-card v-show="!$q.platform.is.mobile && tabs === 'invites'" class="mobile-hide">
      <q-card-section>
        <div class="text-subtitle2">Invite People</div>
          <q-input v-model="newInvitation.email" type="email" label="Email" stack-label>
            <template v-slot:append>
              <q-select v-if="isAdmin" v-model="newInvitation.permission" placeholder="Permission" :options="['contributor','admin']"  label="Permission" stack-label style="min-width:100px" />
              <q-select v-if="isAdmin && newInvitation.permission === 'contributor'" value="" @input="addNewInviteBudget" :options="budgetOptions" label="Budgets" stack-label style="min-width:100px" />
          </template>
          <template v-slot:after>
            <q-btn dense title="Send Invitation" icon="send" color="positive" @click="addUser" />
          </template>
        </q-input>
        <div v-if="newInvitation.budgets.length > 0 && newInvitation.permission === 'contributor'">Accessible Budgets</div>
        <div class="q-gutter-xs">
          <q-chip color="primary" text-color="white" dense square v-for="budget in newInvitation.budgets" :key="'budget-'+budget" removable @remove="removeNewInviteBudget(budget)">
            {{ budgets[budget] ? budgets[budget].label : budgetCategories[budget] ? budgetCategories[budget].label : accounts[budget].label }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>
    <q-table
      v-show="tabs === 'invites'"
      class="my-sticky-header-table q-mt-md"
      :data="invites"
      :columns="invitesColumns"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="'invites'+tableKey"
      :filter="invitesFilter"
      rows-per-page-label="Users per page:"
      :pagination.sync="invitesPagination"
      dense
      @update:pagination="$q.localStorage.set('invitesTableRows', $event.rowsPerPage)"
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">Invites</div>

        <q-space />

        <q-input borderless dense debounce="300" v-model="invitesFilter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold">
          <q-td key="name" :props="props" class="cursor-pointer">
            <q-avatar class="q-pr-md" size="md" >
              <img :src="props.row.photoURL ? props.row.photoURL : 'http://tinygraphs.com/spaceinvaders/' + props.row.uid + '?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
            </q-avatar>
            <!-- <q-popup-edit v-model="props.row.label">
              <q-input :value="props.row.label > '' ? props.row.label : ''" @input="updateAccount(props.row.id, 'label', $event)" dense autofocus label="Budget Label" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip> -->
          </q-td>
          <q-td key="email" :props="props">
            {{ props.row.email }}
           <!--  ${{ props.row.income.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
          <q-td key="permission" :props="props">
            {{ props.row.permission }}
           <!--  ${{ props.row.income.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
          <q-td key="budgets" :props="props" class="q-gutter-xs q-pa-xs" style="white-space: normal;max-width:300px">
            <q-select :options="budgetOptions" dense style="min-width:100px;max-width:150px" @input="addInviteBudget(props.row.budgets, $event.id, props.row.uid)" value="" />
              <q-chip color="primary" text-color="white" dense square multiline v-for="budget in props.row.budgets" :key="'budget-'+budget" removable @remove="removeInviteBudget(props.row.budgets, budget, props.row.uid)">
                {{ budgets[budget] ? budgets[budget].label : budgetCategories[budget] ? budgetCategories[budget].label : accounts[budget].label }}
                <!-- <q-btn flat dense rounded size="xs" icon="close" @click="removeInviteBudget(props.row.budgets, budget, props.row.email)" /> -->
              </q-chip>
           <!--  ${{ props.row.income.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
          <q-td key="actions" :props="props" class="text-negative">
            <q-btn dense icon="delete" color="negative" @click="removeInvite(props.row.email)" />
           <!--  ${{ props.row.expenses.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-table
      v-show="tabs === 'admins'"
      class="my-sticky-header-table"
      :data="admins"
      :columns="adminsColumns"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="'admins'+tableKey"
      :filter="adminsFilter"
      rows-per-page-label="Users per page:"
      :pagination.sync="adminsPagination"
      dense
      @update:pagination="$q.localStorage.set('adminsTableRows', $event.rowsPerPage)"
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">Admins</div>

        <q-space />

        <!-- <div v-if="$q.screen.gt.xs" class="col">
          <q-toggle v-for="column in columns" v-model="visibleColumns" :val="column.name" :label="column.label" :key="column.name" />
        </div>
 -->    <!-- <q-select
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
        /> -->

        <q-input borderless dense debounce="300" v-model="adminsFilter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold">
          <q-td key="name" :props="props" class="cursor-pointer">
            <q-avatar class="q-pr-md" size="md" >
              <img :src="props.row.photoURL ? props.row.photoURL : 'http://tinygraphs.com/spaceinvaders/' + props.row.uid + '?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
            </q-avatar>
            {{ props.row.name ? props.row.name : 'Anonymous' }}
            <!-- <q-popup-edit v-model="props.row.label">
              <q-input :value="props.row.label > '' ? props.row.label : ''" @input="updateAccount(props.row.id, 'label', $event)" dense autofocus label="Budget Label" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip> -->
          </q-td>
          <q-td key="email" :props="props">
            {{ props.row.email }}
           <!--  ${{ props.row.income.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
          <q-td key="actions" :props="props" class="text-negative">
            <q-btn dense icon="delete" color="negative" @click="removeUser(props.row.uid)" />
           <!--  ${{ props.row.expenses.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-table
      v-show="tabs === 'contributors'"
      class="my-sticky-header-table"
      :data="contributors"
      :columns="contributorsColumns"
      :rows-per-page-options="[5,6,7,8,9,10,15,20,50,100]"
      row-key="name"
      :key="'contributors'+tableKey"
      :filter="contributorsFilter"
      rows-per-page-label="Users per page:"
      :pagination.sync="contributorsPagination"
      dense
      @update:pagination="$q.localStorage.set('contributorsTableRows', $event.rowsPerPage)"
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">Contributors</div>

        <q-space />

        <q-input borderless dense debounce="300" v-model="contributorsFilter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" class="text-bold">
          <q-td key="name" :props="props" class="cursor-pointer">
            <q-avatar class="q-pr-md" size="md" >
              <img :src="props.row.photoURL ? props.row.photoURL : 'http://tinygraphs.com/spaceinvaders/' + props.row.uid + '?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
            </q-avatar>
            {{ props.row.name ? props.row.name : 'Anonymous' }}
            <!-- <q-popup-edit v-model="props.row.label">
              <q-input :value="props.row.label > '' ? props.row.label : ''" @input="updateAccount(props.row.id, 'label', $event)" dense autofocus label="Budget Label" />
            </q-popup-edit>
            <q-tooltip anchor="center right" self="center left" content-class="bg-accent text-black">
              <q-icon name="edit"/>
              Edit
            </q-tooltip> -->
          </q-td>
          <q-td key="email" :props="props">
            {{ props.row.email }}
           <!--  ${{ props.row.income.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
          <q-td key="budgets" :props="props" class="q-gutter-xs q-pa-xs" style="white-space: normal;max-width:300px">
            <q-select :options="budgetOptions" dense style="min-width:100px;max-width:150px" @input="addContributorBudget(props.row.budgets, $event.id, props.row.uid)" value="" />
              <q-chip color="primary" text-color="white" dense square multiline v-for="budget in props.row.budgets" :key="'budget-'+budget" removable @remove="removeContributorBudget(props.row.budgets, budget, props.row.uid)">
                {{ budgets[budget] ? budgets[budget].label : budgetCategories[budget] ? budgetCategories[budget].label : accounts[budget].label }}
                <!-- <q-btn flat dense rounded size="xs" icon="close" @click="removeInviteBudget(props.row.budgets, budget, props.row.email)" /> -->
              </q-chip>
           <!--  ${{ props.row.income.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
          <q-td key="actions" :props="props" class="text-negative">
            <q-btn dense icon="delete" color="negative" @click="removeUser(props.row.uid)" />
           <!--  ${{ props.row.expenses.toFixed(2) }}
            <q-tooltip content-class="bg-accent text-black">
              Auto Calculated
            </q-tooltip> -->
          </q-td>
        </q-tr>
      </template>
    </q-table>

  </q-page>
</template>

<script>
import { uid } from 'quasar'
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/firestore')
// let md5 = require('js-md5')

const adminsColumns = [
  { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
  { name: 'email', align: 'center', label: 'Email', field: 'email', sortable: true },
  { name: 'actions', align: 'right', label: 'Actions', field: 'actions' }
]

const contributorsColumns = [
  { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
  { name: 'email', align: 'center', label: 'Email', field: 'email', sortable: true },
  { name: 'budgets', align: 'left', label: 'Budgets', field: 'budgets', sortable: true },
  { name: 'actions', align: 'right', label: 'Actions', field: 'actions' }
]

const invitesColumns = [
  { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'permission', align: 'left', label: 'Permission', field: 'permission', sortable: true },
  { name: 'budgets', align: 'left', label: 'Budgets', field: 'budgets', sortable: true },
  { name: 'actions', align: 'right', label: 'Actions', field: 'actions' }
]

export default {
  data () {
    return {
      tabs: 'invites',
      right: false,
      share: false,
      newInvitation: {
        email: '',
        permission: 'contributor',
        accepted: false,
        sent: false,
        projectName: '',
        fromName: '',
        budgets: []
      },
      // admins: []
      adminsColumns,
      adminsFilter: '',
      adminsPagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      // contributors: []
      contributorsColumns,
      contributorsFilter: '',
      contributorsPagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      // invites: []
      invitesColumns,
      invitesFilter: '',
      invitesPagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      }
    }
  },
  created () {
    // console.log(this.$route.name)
    this.newInvitation.fromName = this.user.displayName
    this.newInvitation.projectName = this.project.name
    this.adminsPagination.rowsPerPage = this.$q.localStorage.getItem('adminsTableRows')
    this.contributorsPagination.rowsPerPage = this.$q.localStorage.getItem('contributorsTableRows')
    this.invitesPagination.rowsPerPage = this.$q.localStorage.getItem('invitesTableRows')
  },
  computed: {
    ...mapGetters([
      'project',
      'user',
      'admins',
      'contributors',
      'isAdmin',
      'budgetOptions',
      'accounts',
      'budgets',
      'budgetCategories',
      'invites',
      'tableKey'
    ])
  },
  methods: {
    uuid () {
      return uid()
    },
    // replaceByDefault (e) {
    //   console.log('http://tinygraphs.com/spaceinvaders/' + uid() + '?theme=bythepool&numcolors=4&size=220&fmt=svg')
    //   e.target.src = 'http://tinygraphs.com/spaceinvaders/' + uid() + '?theme=bythepool&numcolors=4&size=220&fmt=svg'
    // },
    // getHash (val) {
    //   return md5(val.trim().toLowerCase())
    // },
    addContributorBudget (budgets, newBudget, uid) {
      // console.log(this.newInvitation.budgets.indexOf(event.id) !== -1)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      if (tempBudgets.indexOf(newBudget) === -1) {
        tempBudgets.push(newBudget)
        firebase.firestore().collection(`/projects/${this.$route.params.id}/contributors`).doc(uid).update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Added Successfully'
            })
          }).catch(err => {
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
    removeContributorBudget (budgets, newBudget, uid) {
      // var overrideStyleVal = this.overrideStyles[event].id
      // console.log(overrideStyleVal)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      var index = tempBudgets.indexOf(newBudget)
      if (index > -1) {
        tempBudgets.splice(index, 1)
        firebase.firestore().collection(`/projects/${this.$route.params.id}/contributors`).doc(uid).update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Removed Successfully'
            })
          }).catch(err => {
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
    addInviteBudget (budgets, newBudget, email) {
      // console.log(this.newInvitation.budgets.indexOf(event.id) !== -1)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      if (tempBudgets.indexOf(newBudget) === -1) {
        tempBudgets.push(newBudget)
        firebase.firestore().collection(`/projects/${this.$route.params.id}/invites`).doc(email).update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Budget Added Successfully'
            })
          }).catch(err => {
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
    removeInviteBudget (budgets, newBudget, email) {
      // var overrideStyleVal = this.overrideStyles[event].id
      // console.log(overrideStyleVal)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      var index = tempBudgets.indexOf(newBudget)
      if (index > -1) {
        tempBudgets.splice(index, 1)
        firebase.firestore().collection(`/projects/${this.$route.params.id}/invitess`).doc(email).update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Budget Removed Successfully'
            })
          }).catch(err => {
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
    addNewInviteBudget (event) {
      // console.log(this.newInvitation.budgets.indexOf(event.id) !== -1)
      if (this.newInvitation.budgets.indexOf(event.id) === -1) {
        this.newInvitation.budgets.push(event.id)
      }
    },
    removeNewInviteBudget (event) {
      // var overrideStyleVal = this.overrideStyles[event].id
      // console.log(overrideStyleVal)
      var index = this.newInvitation.budgets.indexOf(event)
      if (index > -1) {
        this.newInvitation.budgets.splice(index, 1)
      }
    },
    addUser (uid) {
      // console.log(`/projects/${this.$route.params.id}/invites/${this.newInvitation.email}`)
      for (var key in this.invites) {
        if (this.newInvitation.email.toLowerCase() === this.invites[key].email.toLowerCase()) {
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Invite already sent'
          })
          return
        }
      }
      for (key in this.contributors) {
        if (this.newInvitation.email.toLowerCase() === this.contributors[key].email.toLowerCase()) {
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'User already has access'
          })
          return
        }
      }
      firebase.firestore().collection(`/projects/${this.$route.params.id}/invites`).doc(this.newInvitation.email).set(this.newInvitation)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Added Successfully'
          })
        }).catch(err => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
    },
    removeUser (uid) {
      // console.log(`/projects/${this.$route.params.id}/contributors/${event}`)
      firebase.firestore().doc(`/projects/${this.$route.params.id}/contributors/${uid}`).delete()
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Removed Successfully'
          })
        }).catch(err => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
    },
    removeInvite (email) {
      // console.log(`/projects/${this.$route.params.id}/contributors/${event}`)
      firebase.firestore().doc(`/projects/${this.$route.params.id}/invites/${email}`).delete()
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Invite Removed Successfully'
          })
        }).catch(err => {
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
  watch: {
    project (oldVal, newVal) {
      this.newInvitation.projectName = this.project.name
    }
  //   newInvitation (oldVal, newVal) {
  //     if (oldVal.permission !== newVal.permission) {
  //       if (this.newInvitation.permission === 'contributor') {
  //         this.newInvitation.budgets = []
  //       } else {
  //         this.newInvitation.budgets = ['all']
  //       }
  //     }
  //   }
  }
}
</script>

<!-- <style>
  .q-table tbody td {
    white-space: normal;
  }
</style>
 -->
