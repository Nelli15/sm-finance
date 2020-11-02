<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
 -->
          SP Finances - {{ project.name }}
        </q-toolbar-title>
        <!-- <q-tooltip content-class="bg-accent text-grey-10">
            Who can see this?
          </q-tooltip>
        </q-btn> -->

        <q-btn flat no-caps>
          <q-tooltip content-class="bg-accent text-grey-10">
            Who am I?
          </q-tooltip>
          <q-avatar>
            <img
              :src="
                user.photoURL
                  ? user.photoURL
                  : 'http://tinygraphs.com/spaceinvaders/' +
                    user.uid +
                    '?theme=bythepool&numcolors=4&size=220&fmt=svg'
              "
            />
          </q-avatar>
          <div class="q-pl-sm">{{ user.displayName }}</div>
          <q-menu anchor="bottom left" self="top left" style="content:fit;">
            <q-card class="my-card">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img
                      :src="
                        user.photoURL
                          ? user.photoURL
                          : 'http://tinygraphs.com/spaceinvaders/' +
                            user.uid +
                            '?theme=bythepool&numcolors=4&size=220&fmt=svg'
                      "
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.displayName }}</q-item-label>
                  <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-card-actions vertical align="center">
                <q-btn
                  flat
                  icon="logout"
                  label="Logout"
                  :to="{ name: 'logout' }"
                />
              </q-card-actions>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
      <q-toolbar>
        <q-tabs align="left" shrink>
          <q-route-tab to="/dashboard" icon="dashboard" label="Dashboard" />
          <q-route-tab
            :to="{ name: 'summary' }"
            icon="category"
            label="Summary"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'budget' }"
            icon="reorder"
            label="Budgets"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'transactions' }"
            icon="mdi-bank-transfer"
            label="Transactions"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'myTransactions' }"
            icon="mdi-bank-transfer"
            label="Transactions"
            v-if="isContributor"
          />
          <q-route-tab
            :to="{ name: 'petty' }"
            icon="mdi-cash-register"
            label="Petty Cash"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'access' }"
            icon="people"
            label="Share"
            v-if="isAdmin"
          />
        </q-tabs>
        <q-space />
        <q-tabs
          align="right"
          v-if="isAdmin"
          indicator-color="primary"
          class="mobile-hide"
        >
          <q-tab
            v-for="account in headerAccounts"
            :key="account.label + '-' + tableKey"
            :ripple="false"
            style="cursor:default;"
          >
            {{ account.label }}:
            <q-badge
              :class="{
                'bg-green-8': (account.balance ? account.balance : 0) > 0,
                'bg-red-8': (account.balance ? account.balance : 0) < 0,
                'bg-black': (account.balance ? account.balance : 0) == 0
              }"
              icon="account_balance"
              :label="'$' + (account.balance ? account.balance : 0).toFixed(2)"
            />
          </q-tab>
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { uid } from 'quasar'
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/firestore')
// let md5 = require('js-md5')

export default {
  data() {
    return {
      right: false,
      newInvitation: {
        email: '',
        permission: 'contributor',
        accepted: false,
        sent: false,
        projectName: '',
        fromName: '',
        budgets: []
      }
      // admins: []
    }
  },
  preFetch({ store, currentRoute }) {
    store.dispatch('fetchBudgets', currentRoute.params.id)
    store.dispatch('fetchBudgetCategories', currentRoute.params.id)
    store.dispatch('fetchAccounts', currentRoute.params.id)
  },
  created() {
    // console.log(this.$route.name)
    this.$store.dispatch('fetchProject', {
      projectId: this.$route.params.id,
      uid: this.user.uid
    })
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgetCategories', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
    // this.$store.dispatch('fetchAccounts', this.$route.params.id)
    // this.$store.dispatch('fetchContributors', this.$route.params.id)
    // this.$store.dispatch('fetchInvites', this.$route.params.id)
    this.newInvitation.fromName = this.user.displayName
    this.newInvitation.projectName = this.project.name
  },
  computed: {
    ...mapGetters([
      'project',
      'user',
      'admins',
      'contributors',
      'isAdmin',
      'isContributor',
      'budgetOptions',
      'accounts',
      'budgets',
      'budgetCategories',
      'invites',
      'pettyTotals',
      'tableKey',
      'headerAccounts'
    ])
  },
  methods: {
    uuid() {
      return uid()
    },
    // replaceByDefault (e) {
    //   console.log('http://tinygraphs.com/spaceinvaders/' + uid() + '?theme=bythepool&numcolors=4&size=220&fmt=svg')
    //   e.target.src = 'http://tinygraphs.com/spaceinvaders/' + uid() + '?theme=bythepool&numcolors=4&size=220&fmt=svg'
    // },
    // getHash (val) {
    //   return md5(val.trim().toLowerCase())
    // },
    addContributorBudget(budgets, newBudget, uid) {
      // console.log(this.newInvitation.budgets.indexOf(event.id) !== -1)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      if (tempBudgets.indexOf(newBudget) === -1) {
        tempBudgets.push(newBudget)
        firebase
          .firestore()
          .collection(`/projects/${this.$route.params.id}/contributors`)
          .doc(uid)
          .update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Added Successfully'
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
    removeContributorBudget(budgets, newBudget, uid) {
      // var overrideStyleVal = this.overrideStyles[event].id
      // console.log(overrideStyleVal)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      var index = tempBudgets.indexOf(newBudget)
      if (index > -1) {
        tempBudgets.splice(index, 1)
        firebase
          .firestore()
          .collection(`/projects/${this.$route.params.id}/contributors`)
          .doc(uid)
          .update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Removed Successfully'
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
    addInviteBudget(budgets, newBudget, email) {
      // console.log(this.newInvitation.budgets.indexOf(event.id) !== -1)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      if (tempBudgets.indexOf(newBudget) === -1) {
        tempBudgets.push(newBudget)
        firebase
          .firestore()
          .collection(`/projects/${this.$route.params.id}/invites`)
          .doc(email)
          .update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Budget Added Successfully'
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
    removeInviteBudget(budgets, newBudget, email) {
      // var overrideStyleVal = this.overrideStyles[event].id
      // console.log(overrideStyleVal)
      let tempBudgets = JSON.parse(JSON.stringify(budgets))
      var index = tempBudgets.indexOf(newBudget)
      if (index > -1) {
        tempBudgets.splice(index, 1)
        firebase
          .firestore()
          .collection(`/projects/${this.$route.params.id}/invitess`)
          .doc(email)
          .update({ budgets: tempBudgets })
          .then(() => {
            // console.log('updated')
            this.$q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'Contributor Budget Removed Successfully'
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
    addNewInviteBudget(event) {
      // console.log(this.newInvitation.budgets.indexOf(event.id) !== -1)
      if (this.newInvitation.budgets.indexOf(event.id) === -1) {
        this.newInvitation.budgets.push(event.id)
      }
    },
    removeNewInviteBudget(event) {
      // var overrideStyleVal = this.overrideStyles[event].id
      // console.log(overrideStyleVal)
      var index = this.newInvitation.budgets.indexOf(event)
      if (index > -1) {
        this.newInvitation.budgets.splice(index, 1)
      }
    },
    addUser(uid) {
      // console.log(`/projects/${this.$route.params.id}/invites/${this.newInvitation.email}`)
      for (var key in this.invites) {
        if (
          this.newInvitation.email.toLowerCase() ===
          this.invites[key].email.toLowerCase()
        ) {
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
        if (
          this.newInvitation.email.toLowerCase() ===
          this.contributors[key].email.toLowerCase()
        ) {
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'User already has access'
          })
          return
        }
      }
      firebase
        .firestore()
        .collection(`/projects/${this.$route.params.id}/invites`)
        .doc(this.newInvitation.email)
        .set(this.newInvitation)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Added Successfully'
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
    removeUser(uid) {
      // console.log(`/projects/${this.$route.params.id}/contributors/${event}`)
      firebase
        .firestore()
        .doc(`/projects/${this.$route.params.id}/contributors/${uid}`)
        .delete()
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'User Removed Successfully'
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
    removeInvite(email) {
      // console.log(`/projects/${this.$route.params.id}/contributors/${event}`)
      firebase
        .firestore()
        .doc(`/projects/${this.$route.params.id}/invites/${email}`)
        .delete()
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Invite Removed Successfully'
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
  watch: {
    project(oldVal, newVal) {
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
