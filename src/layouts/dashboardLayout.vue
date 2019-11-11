<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar> -->
          SP Finances
        </q-toolbar-title>
        <q-btn icon="add" flat dense @click="createProject">
          <q-tooltip content-class="bg-accent text-grey-10">
            Add a Project
          </q-tooltip>
        </q-btn>
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

     <!--  <q-tabs align="left">
        <q-route-tab :to="{ name: 'summary' }" label="Summary" />
        <q-route-tab :to="{ name: 'budget' }" label="Budget" />
        <q-route-tab :to="{ name: 'transactions' }" label="Transactions" />
        <q-route-tab :to="{ name: 'petty' }" label="Petty Cash" />
      </q-tabs>
 -->    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/functions')

export default {
  data () {
    return {
      right: false
      // admins: []
    }
  },
  created () {
    // console.log(this.user.uid)
    if (this.user.uid) {
      this.$store.dispatch('fetchProjects', this.user.uid)
    }
  },
  methods: {
    async createProject () {
      let createProject = firebase.functions().httpsCallable('createProject')
      createProject()
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Project Created Successfully'
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
      // console.log(res)
    }
  },
  computed: {
    ...mapGetters([
      // 'projects',
      'user'
      // 'admins',
      // 'contributors'
    ])
  },
  watch: {
    user () {
      // console.log(this.user.uid)
      this.$store.dispatch('fetchProjects', this.user.uid)
    }
  }
}
</script>
