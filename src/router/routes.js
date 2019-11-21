import auth from './../store/modules/auth.js'
import firebase from 'firebase/app'
require('firebase/firestore')

const routes = [
  {
    path: '/dashboard',
    component: () => import('layouts/dashboardLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('pages/dashboardPage.vue'), beforeEnter: (to, from, next) => isLoggedIn(to, from, next) }
    ]
  },
  {
    path: '/project/:id',
    component: () => import('layouts/standardLayout.vue'),
    children: [
      { path: 'summary', name: 'summary', component: () => import('pages/summaryPage.vue'), beforeEnter: (to, from, next) => isAdmin(to, from, next) },
      { path: 'budget', name: 'budget', component: () => import('pages/budgetPage.vue'), beforeEnter: (to, from, next) => isAdmin(to, from, next) },
      { path: 'budget/:budgetCategory', component: () => import('pages/budgetPage.vue'), beforeEnter: (to, from, next) => isAdmin(to, from, next) },
      { path: 'petty', name: 'petty', component: () => import('pages/pettyCashPage.vue'), beforeEnter: (to, from, next) => isAdmin(to, from, next) },
      { path: 'transactions', name: 'transactions', component: () => import('pages/transactionsPage.vue'), beforeEnter: (to, from, next) => isAdmin(to, from, next) },
      { path: 'transactions/:budgetCategory', component: () => import('pages/transactionsPage.vue'), beforeEnter: (to, from, next) => isAdmin(to, from, next) },
      { path: 'addTransaction', name: 'addTrans', component: () => import('components/sp-trans-form.vue'), beforeEnter: (to, from, next) => isProjectContributor(to, from, next) },
      { path: 'access', name: 'access', component: () => import('pages/accessPage.vue'), beforeEnter: (to, from, next) => isAdmin(to, from, next) }
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
  },
  {
    path: '/',
    redirect: '/dashboard'
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

async function isAdmin (to, from, next) {
  if (auth.state.userLoadStatus === false) {
    // console.log('awaiting user check')
    setTimeout(async () => isAdmin(to, from, next), 10)
  } else {
    // console.log('user found', auth.state.user.uid)
    let res = await firebase.firestore().doc(`/projects/${to.params.id}/contributors/${auth.state.user.uid}`).get()
      .catch(err => {
        console.log(err)
        next('/login')
      })
    // console.log(res)
    if (res) {
      if (!res.exists) next('/login')
      else if (res.get('permission') !== 'admin') next('/dashboard')
      else next()
    }
  }
}

async function isProjectContributor (to, from, next) {
  if (auth.state.userLoadStatus === false) {
    // console.log('awaiting user check')
    setTimeout(async () => isProjectContributor(to, from, next), 10)
  } else {
    // console.log('user found', auth.state.user.uid)
    let res = await firebase.firestore().doc(`/projects/${to.params.id}/contributors/${auth.state.user.uid}`).get()
      .catch(err => {
        console.log(err)
        next('/login')
      })
    // console.log(res)
    if (res) {
      if (!res.exists) next('/login')
      else if (res.get('permission') !== 'admin' && res.get('permission') !== 'contributor') next('/dashboard')
      else next()
    }
  }
}

async function isLoggedIn (to, from, next) {
  // if (from.name === 'login') next()
  // if (auth.state.user.uid === false) {
  //   console.log('awaiting user check')
  //   setTimeout(async () => isLoggedIn(to, from, next), 100)
  // } else {
  //   console.log('user found', to, from, auth.state.user.uid)
  //   if (!auth.state.user.uid) next('/login')
  //   else next()
  // }
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      next()
    } else {
      next('/login')
    }
  })
}

// function isContributor (to, from, next) {

// }
