
const routes = [
  {
    path: '/dashboard',
    component: () => import('layouts/dashboardLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('pages/dashboardPage.vue') }
    ]
  },
  {
    path: '/project/:id',
    component: () => import('layouts/standardLayout.vue'),
    children: [
      { path: 'summary', name: 'summary', component: () => import('pages/summaryPage.vue') },
      { path: 'budget', name: 'budget', component: () => import('pages/budgetPage.vue') },
      { path: 'budget/:budgetCategory', component: () => import('pages/budgetPage.vue') },
      { path: 'petty', name: 'petty', component: () => import('pages/pettyCashPage.vue') },
      { path: 'transactions', name: 'transactions', component: () => import('pages/transactionsPage.vue') },
      { path: 'transactions/:budgetCategory', component: () => import('pages/transactionsPage.vue') }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/login.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('pages/logout.vue')
  }
  // { path: '*', redirect: '/summary' }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
