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
            <q-btn flat icon="people" label="Share">
      <q-tooltip content-class="bg-accent text-grey-10">
        Who can see this?
      </q-tooltip>
    </q-btn>
    <q-dialog>
      <!-- <div v-if="userRoles.superEditor"> -->
      <q-card class="q-pl-md q-pr-lg" style="min-width:800px">
        <q-btn flat dense title="Close" icon="close" style="position:absolute;top:10px;right:10px;z-index:5;" />
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section class="text-h5">
                  Sharing settings
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <!-- <q-card-section>
            <q-input v-model="newInvitation.email" placeholder="Email" type="email">
              <template v-slot:before>
                <div class="text-subtitle2">Invite People</div>
              </template>
              <template v-slot:append>
              <q-select v-if="superEditor && !owner" v-model="newInvitation.role" placeholder="Role" :options="['viewer','editor','super editor']" />
              <q-select v-if="owner" v-model="newInvitation.role" placeholder="Role" :options="['viewer','editor','super editor', 'owner']" />
            </template>
            <template v-slot:after>
              <q-btn dense @click="sendInvite" title="Send Invitation" icon="send" color="positive" />
            </template>
            </q-input>
          </q-card-section>
          <q-separator /> -->
          <q-card-section v-if="admins.length > 0">
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
                  {{ member.role }}
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
          </q-card-section>
          <!-- <q-separator v-if="requests.length > 0" />
          <q-card-section>
            <div class="text-subtitle2">Who has access</div>
          </q-card-section>
          <q-card-section style="max-height: 40vh;" class="scroll">
            <q-list separator>
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
                  {{ member.role }}
                  <q-popup-edit :value="member.role" dense v-if="superEditor">
                    <q-select v-if="superEditor && !owner" :value="member.role" :options="['viewer','editor','super editor']" dense autofocus counter @input="updateRole(member, $event)" />
                    <q-select v-if="owner" :value="member.role" :options="['viewer','editor','super editor', 'owner']" dense autofocus counter @input="updateRole(member, $event)" />
                  </q-popup-edit>
                </q-item-section>
                <q-item-section side>
                  <q-btn dense icon="delete" color="negative" @click="deleteRole(member)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section> -->
          <!-- <q-separator v-if="invites.length > 0" />
          <q-card-section v-if="invites.length > 0">
            <div class="text-subtitle2">Pending Invites</div>
          </q-card-section>
          <q-card-section v-if="invites.length > 0" style="max-height: 40vh" class="scroll">
            <q-list separator>
              <q-item v-for="member in invites" :key="member.id" class="shadow-1 rounded-borders">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="'http://tinygraphs.com/spaceinvaders/'+uuid()+'?theme=bythepool&numcolors=4&size=220&fmt=svg'" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{ member.name }}
                </q-item-section>
                <q-item-section style="min-width:250px">
                  {{ member.email }}
                </q-item-section>
                <q-item-section>
                  {{ member.role }}
                </q-item-section>
                <q-item-section side>
                  <q-btn dense icon="delete" color="negative" @click="deleteInvite(member)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section> -->
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
            <img :src="user.photoURL" />
          </q-avatar>
          <div class="q-pl-sm">{{ user.displayName }}</div>
          <q-menu anchor="bottom left" self="top left" style="content:fit;">
            <q-card class="my-card">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="user.photoURL" />
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

      <q-tabs align="left">
        <q-route-tab to="/dashboard" label="Dashboard" />
        <q-route-tab :to="{ name: 'summary' }" label="Summary" v-if="isAdmin" />
        <q-route-tab :to="{ name: 'budget' }" label="Budgets" v-if="isAdmin" />
        <q-route-tab :to="{ name: 'transactions' }" label="Transactions" v-if="isAdmin" />
        <q-route-tab :to="{ name: 'petty' }" label="Petty Cash" v-if="isAdmin" />
      </q-tabs>
    </q-header>

    <q-page-container v-if="isAdmin || $route.name ==='addTrans'">
      <router-view />
    </q-page-container>
    <q-page-container v-else>
      <q-page>
        <q-banner>
          <div class="text-h6">
            403 Unauthorised! You are not Authorised to be here.
          </div>
        </q-banner>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
// import firebase from 'firebase/app'
// require('firebase/auth')

export default {
  data () {
    return {
      right: false
      // admins: []
    }
  },
  created () {
    console.log(this.$route.name)
    this.$store.dispatch('fetchProject', { projectId: this.$route.params.id, uid: this.user.uid })
    this.$store.dispatch('fetchTransactions', this.$route.params.id)
    this.$store.dispatch('fetchBudgetCategories', this.$route.params.id)
    this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  computed: {
    ...mapGetters([
      'project',
      'user',
      'admins',
      'contributors',
      'isAdmin'
    ])
  }
}
</script>
