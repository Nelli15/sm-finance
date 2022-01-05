<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title> SP Finances - {{ project.name }} </q-toolbar-title>

        <q-btn flat no-caps>
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
                  :to="{ name: 'logout', params: { id: $route.params.id } }"
                />
              </q-card-actions>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
      <q-toolbar>
        <q-tabs align="left" shrink>
          <q-route-tab
            :to="{ name: 'dashboard', params: { id: $route.params.id } }"
            icon="dashboard"
            label="Dashboard"
          />
          <q-route-tab
            :to="{ name: 'summary', params: { id: $route.params.id } }"
            icon="category"
            label="Summary"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'budget', params: { id: $route.params.id } }"
            icon="reorder"
            label="Budgets"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'transactions', params: { id: $route.params.id } }"
            icon="mdi-bank-transfer"
            label="Transactions"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'actions', params: { id: $route.params.id } }"
            icon="task_alt"
            label="Actions"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'myTransactions', params: { id: $route.params.id } }"
            icon="mdi-bank-transfer"
            label="Transactions"
            v-if="isContributor"
          />
          <q-route-tab
            :to="{ name: 'petty', params: { id: $route.params.id } }"
            icon="mdi-cash-register"
            label="Petty Cash"
            v-if="isAdmin"
          />
          <q-route-tab
            :to="{ name: 'access', params: { id: $route.params.id } }"
            icon="people"
            label="Share"
            v-if="isAdmin"
          />

          <q-tab targer icon="help" label="Finance Manual" v-if="isAdmin">
            <q-menu>
              <q-list class="bg-primary">
                <q-item>
                  <q-item-section
                    ><a
                      href="/manual-vic.pdf"
                      class="text-white"
                      style="text-decoration: none"
                      target="blank"
                      >Victoria</a
                    ></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section>
                    <a
                      href="/manual.pdf"
                      class="text-white"
                      style="text-decoration: none"
                      target="blank"
                      >All Other States</a
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-tab>
          <q-tab targer icon="help" label="Finance Manual" v-else>
            <q-menu>
              <q-list class="bg-primary">
                <q-item>
                  <q-item-section
                    ><a
                      href="/contributor-manual-vic.pdf"
                      class="text-white"
                      style="text-decoration: none"
                      target="blank"
                      >Victoria</a
                    ></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section>
                    <a
                      href="/contributor-manual.pdf"
                      class="text-white"
                      style="text-decoration: none"
                      target="blank"
                      >All Other States</a
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-tab>
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
            :key="account.label"
            :ripple="false"
            style="cursor: default"
          >
            {{ account.label }}:
            <q-badge
              :class="{
                'bg-green-8': (account.balance ? account.balance : currency(0)).value > 0,
                'bg-red-8': (account.balance ? account.balance : currency(0)).value < 0,
                'bg-black': (account.balance ? account.balance : currency(0)).value == 0,
              }"
              icon="account_balance"
              :label="(account.balance ? account.balance : currency(0)).format()"
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
import { mapGetters } from 'vuex'

export default {
  data() {
    return {}
  },
  preFetch({ store, currentRoute }) {
    store.dispatch('budgets/fetchBudgets', currentRoute.params.id)
    store.dispatch('budgets/fetchBudgetCategories', currentRoute.params.id)
    store.dispatch('budgets/fetchAccounts', currentRoute.params.id)
    store.dispatch('transactions/fetchTransactions', currentRoute.params.id)
  },
  created() {
    this.$store.dispatch('projects/fetchProject', {
      projectId: this.$route.params.id,
      uid: this.user.uid,
    })
  },
  computed: {
    ...mapGetters('projects', ['isAdmin', 'isContributor', 'project']),
    ...mapGetters('budgets', ['headerAccounts']),
    ...mapGetters('auth', ['user']),
  },
}
</script>
