<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title> SP Finances </q-toolbar-title>
        <q-btn
          icon="add"
          flat
          dense
          @click="createProject"
          v-if="
            user &&
            user.email &&
            (user.email.includes('@powertochange.org.au') ||
              user.email.includes('@example.com'))
          "
        >
          <q-tooltip class="bg-accent text-grey-10"> Add a Project </q-tooltip>
        </q-btn>
        <q-btn flat no-caps>
          <!-- {{ user }} -->
          <q-tooltip class="bg-accent text-grey-10"> Who am I? </q-tooltip>
          <q-avatar>
            <img
              :src="
                user.photoURL
                  ? user.photoURL
                  : 'https://avatars.dicebear.com/api/bottts/' +
                    user.uid +
                    '.svg'
              "
            />
          </q-avatar>
          <div class="q-pl-sm">{{ user.displayName }}</div>
          <q-menu anchor="bottom left" self="top left" style="content: fit">
            <q-card class="my-card">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img
                      :src="
                        user.photoURL
                          ? user.photoURL
                          : 'https://avatars.dicebear.com/api/bottts/' +
                            user.uid +
                            '.svg'
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
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFunctions, httpsCallable } from 'firebase/functions'

export default {
  data() {
    return {
      right: false,
      // admins: []
    }
  },
  created() {
    // console.log(this.user.uid)
    if (this.user.uid) {
      this.$store.dispatch('projects/fetchProjects', this.user.uid)
    }
  },
  methods: {
    async createProject() {
      this.$q.loading.show()
      let createProject = httpsCallable(getFunctions(), 'createProject')
      createProject()
        .then(() => {
          // console.log('updated')
          this.$q.loading.hide()
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Project Created Successfully',
          })
        })
        .catch((err) => {
          this.$q.loading.hide()
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
    ...mapGetters('auth', ['user']),
  },
  watch: {
    user() {
      this.$store.dispatch('projects/fetchProjects', this.user.uid)
    },
  },
}
</script>
