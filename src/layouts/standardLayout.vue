<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
 -->          SP Finances - {{ project.name }}
        </q-toolbar-title>
        <!-- <q-btn flat icon="people" label="Share" to="access" v-if="isAdmin"> -->
        <!-- <q-btn flat icon="people" label="Share" @click="share = !share" v-if="isAdmin"> -->
          <!-- <q-tooltip content-class="bg-accent text-grey-10">
            Who can see this?
          </q-tooltip>
        </q-btn> -->
        <q-dialog v-model="share" v-if="isAdmin">
          <!-- <div v-if="userRoles.superEditor"> -->
          <q-card class="q-pl-md q-pr-lg" style="min-width:800px">
            <q-btn flat dense title="Close" icon="close" style="position:absolute;top:10px;right:10px;z-index:5;" @click="share = false" />
              <q-card-section>
                <q-list>
                  <q-item>
                    <q-item-section class="text-h5">
                      Sharing settings
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
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
                  <q-badge color="blue" v-for="budget in newInvitation.budgets" :key="'budget-'+budget">
                    {{ budgets[budget] ? budgets[budget].label : budgetCategories[budget].label }}
                    <q-btn flat dense rounded size="xs" icon="close" @click="removeNewInviteBudget(budget)" />
                  </q-badge>
                </div>
              </q-card-section>
              <q-separator />
             <!--  <q-card-section v-if="admins.length > 0">
                <div class="text-subtitle2">Pending Requests for access</div>
              </q-card-section>
              <q-card-section style="max-height: 40vh" class="scroll">
                <q-list separator v-if="admins.length > 0">
                  <q-item v-for="member in admins" :key="member.id" class="shadow-1 rounded-borders">
                    <q-item-section avatar>
                      <q-avatar>
                        <img :src="member.photoUrl" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      {{ member.name }}
                    </q-item-section>
                    <q-item-section style="min-width:250px">
                      {{ member.email }}
                    </q-item-section>
                    <q-item-section>
                      {{ member.permission }}
                      <q-popup-edit :value="member.role" dense v-if="superEditor">
                        <q-select v-if="superEditor && !owner" :value="member.role" :options="['viewer','editor','super editor']" dense autofocus counter @input="updateRequest(member, $event)" />
                        <q-select v-if="owner" :value="member.role" :options="['viewer','editor','super editor', 'owner']" dense autofocus counter @input="updateRequest(member, $event)" />
                      </q-popup-edit>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn dense icon="delete" color="negative" @click="deleteRequest(member)" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section> -->
              <!-- <q-separator v-if="requests.length > 0" /> -->
              <q-card-section>
                <div class="text-subtitle2">Who has access</div>
              </q-card-section>
              <q-card-section style="max-height: 40vh;" class="scroll">
                <q-list separator>
                  <!-- Admins -->
                  <div class="text-subtitle2" v-if="admins.length > 0">
                    Admins
                    <q-tooltip content-class="bg-accent text-grey-10">
                      Admins have total control and access over a Project
                    </q-tooltip>
                  </div>
                  <q-item v-for="member in admins" :key="member.id" class="shadow-1 rounded-borders">
                    <q-item-section avatar>
                      <q-avatar>
                        <img :src="member.photoURL ? member.photoURL : 'http://tinygraphs.com/spaceinvaders/' + member.uid + '?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      {{ member.name }}
                    </q-item-section>
                    <q-item-section style="min-width:250px">
                      {{ member.email }}
                    </q-item-section>
                    <!-- <q-item-section clickable>
                      {{ member.permission }}
                      <q-popup-edit :value="member.permission" dense>
                        <q-select  :value="member.role" :options="['viewer','editor','super editor']" dense autofocus counter @input="updateRole(member, $event)" />
                        <q-select :value="member.permission" :options="['contributor','admin']" dense autofocus />
                      </q-popup-edit>
                    </q-item-section> -->
                    <q-item-section side>
                      <q-btn dense icon="delete" color="negative" @click="removeUser(member.uid)" />
                    </q-item-section>
                  </q-item>
                  <!-- Contributors -->
                  <div class="text-subtitle2" v-if="contributors.length > 0">
                    Contributors
                    <q-tooltip content-class="bg-accent text-grey-10">
                      Contributors can submit receipts and transactions for the Budgets they have access to
                    </q-tooltip>
                  </div>
                  <q-item v-for="member in contributors" :key="member.id" class="shadow-1 rounded-borders">
                    <q-item-section avatar>
                      <!-- {{member}} -->
                      <q-avatar>
                        <img :src="member.photoURL ? member.photoURL : 'http://tinygraphs.com/spaceinvaders/' + member.uid + '?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      {{ member.name }}
                    </q-item-section>
                    <q-item-section style="min-width:250px">
                      {{ member.email }}
                    </q-item-section>
                    <!-- <q-item-section clickable>
                      {{ member.permission }}
                      <q-popup-edit :value="member.permission" dense>
                        <q-select :value="member.role" :options="['viewer','editor','super editor']" dense autofocus counter @input="updateRole(member, $event)" />
                        <q-select :value="member.permission" :options="['contributor','admin']" dense autofocus />
                      </q-popup-edit>
                    </q-item-section> -->
                    <q-item-section clickable class="q-gutter-xs q-pr-lg">
                      <!-- <div > -->
                      <q-select :options="budgetOptions" dense autofocus style="min-width:100px;" @input="addContributorBudget(member.budgets, $event.id, member.uid)" value="" label="Budgets" stack-label/>
                      <q-badge color="blue" v-for="budget in member.budgets" :key="'budget-'+budget">
                        {{ budgets[budget] ? budgets[budget].label : budgetCategories[budget] ? budgetCategories[budget].label : ''}}
                        <q-btn flat dense rounded size="xs" icon="close" @click="removeContributorBudget(member.budgets, budget, member.uid)" />
                      </q-badge>
                      <!-- </div> -->
                      <!-- <q-popup-edit :value="member.budgets" dense> -->
                        <!-- <q-select  :value="member.role" :options="['viewer','editor','super editor']" dense autofocus counter @input="updateRole(member, $event)" /> -->
                      <!-- </q-popup-edit> -->
                    </q-item-section>
                    <q-item-section side>
                      <q-btn dense icon="delete" color="negative" @click="removeUser(member.uid)" />
                    </q-item-section>
                  </q-item>
                <!-- </q-list> -->
              <!-- </q-card-section> -->
              <!-- {{invites}} -->
              <!-- <q-separator v-if="invites.length > 0" />
              <q-card-section v-if="invites.length > 0">
                <div class="text-subtitle2">Pending Invites</div>
              </q-card-section> -->
<!--               <q-card-section v-if="invites.length > 0" style="max-height: 40vh" class="scroll">
                <q-list separator> -->
                  <div class="text-subtitle2" v-if="invites.length > 0">
                    Pending Invites
                    <q-tooltip content-class="bg-accent text-grey-10">
                      Invitations that have been sent but not accepted
                    </q-tooltip>
                  </div>
                  <q-item v-for="member in invites" :key="member.id" class="shadow-1 rounded-borders">
                    <q-item-section avatar>
                      <q-avatar>
                        <img :src="'http://tinygraphs.com/spaceinvaders/'+uuid()+'?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
                        <!-- <img :src="'https://www.avatarapi.com/js.aspx?email='+member.email+'&size=40'" /> -->
                      </q-avatar>
                    </q-item-section>
                    <q-item-section style="min-width:250px">
                      {{ member.email }}
                    </q-item-section>
                    <q-item-section clickable>
                      {{ member.permission }}
                      <q-popup-edit :value="member.permission" dense>
                        <!-- <q-select :value="member.role" :options="['viewer','editor','super editor']" dense autofocus counter @input="updateRole(member, $event)" /> -->
                        <q-select :value="member.permission" :options="['contributor','admin']" dense autofocus />
                      </q-popup-edit>
                    </q-item-section>
                    <q-item-section clickable v-if="member.permission === 'contributor'" >
                      <q-select :options="budgetOptions" dense autofocus style="min-width:100px" @input="addInviteBudget(member.budgets, $event.id, member.email)" value="" />
                      <q-badge color="blue" v-for="budget in member.budgets" :key="'budget-'+budget">
                        {{ budgets[budget] ? budgets[budget].label : budgetCategories[budget] ? budgetCategories[budget].label : ''}}
                        <q-btn flat dense rounded size="xs" icon="close" @click="removeInviteBudget(member.budgets, budget, member.email)" />
                      </q-badge>
                      <!-- <q-popup-edit :value="member.budgets" dense> -->
                        <!-- <q-select  :value="member.role" :options="['viewer','editor','super editor']" dense autofocus counter @input="updateRole(member, $event)" /> -->
                      <!-- </q-popup-edit> -->
                    </q-item-section>
                    <q-item-section side>
                      <q-btn dense icon="delete" color="negative" @click="removeInvite(member.email)" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-dialog>

        <q-btn
          flat
          no-caps
        >
          <q-tooltip content-class="bg-accent text-grey-10">
            Who am I?
          </q-tooltip>
          <q-avatar>
            <img :src="user.photoURL ? user.photoURL : 'http://tinygraphs.com/spaceinvaders/' + user.uid + '?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
          </q-avatar>
          <div class="q-pl-sm">{{ user.displayName }}</div>
          <q-menu anchor="bottom left" self="top left" style="content:fit;">
            <q-card class="my-card">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="user.photoURL ? user.photoURL : 'http://tinygraphs.com/spaceinvaders/' + user.uid + '?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
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
          <q-route-tab :to="{ name: 'summary' }" icon="category" label="Summary" v-if="isAdmin" />
          <q-route-tab :to="{ name: 'budget' }" icon="reorder" label="Budgets" v-if="isAdmin" />
          <q-route-tab :to="{ name: 'transactions' }" icon="mdi-bank-transfer" label="Transactions" v-if="isAdmin" />
          <q-route-tab :to="{ name: 'petty' }" icon="mdi-cash-register" label="Petty Cash" v-if="isAdmin" />
          <q-route-tab :to="{ name: 'access' }" icon="people" label="Share" v-if="isAdmin" />
          <!-- <q-btn flat icon="people" label="Share" to="access" v-if="isAdmin"> -->
        </q-tabs>
        <q-space/>
        <q-tabs align="right" v-if="isAdmin" indicator-color="primary">
          <q-tab v-for="account in headerAccounts" :key="account.label+'-'+tableKey" :ripple="false" style="cursor:default;">
            {{account.label}}: <q-badge :class="{ 'bg-green-8': (account.income - account.expenses) > 0, 'bg-red-8': (account.income - account.expenses) < 0, 'bg-black': (account.income - account.expenses) == 0 }" icon="account_balance" :label="'$'+(account.income - account.expenses).toFixed(2)" />
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
  data () {
    return {
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
      }
      // admins: []
    }
  },
  created () {
    // console.log(this.$route.name)
    this.$store.dispatch('fetchProject', { projectId: this.$route.params.id, uid: this.user.uid })
    this.$store.dispatch('fetchTransactions', this.$route.params.id)
    this.$store.dispatch('fetchBudgetCategories', this.$route.params.id)
    this.$store.dispatch('fetchBudgets', this.$route.params.id)
    this.$store.dispatch('fetchAccounts', this.$route.params.id)
    this.$store.dispatch('fetchContributors', this.$route.params.id)
    this.$store.dispatch('fetchInvites', this.$route.params.id)
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
