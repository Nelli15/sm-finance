import { onAuthStateChanged, getAuth } from 'firebase/auth'
import { getFirestore, getDoc, doc } from 'firebase/firestore'

const routes = [
  {
    path: '/dashboard',
    component: () => import('layouts/dashboardLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/dashboardPage.vue'),
        beforeEnter: (to, from) => isLoggedIn(to, from)
      }
    ]
  },
  {
    path: '/project/:id',
    component: () => import('layouts/standardLayout.vue'),
    children: [
      {
        path: 'summary',
        name: 'summary',
        component: () => import('pages/summaryPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      },
      {
        path: 'budget',
        name: 'budget',
        component: () => import('pages/budgetPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      },
      {
        path: 'budget/:budgetCategory',
        component: () => import('pages/budgetPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      },
      {
        path: 'petty',
        name: 'petty',
        component: () => import('pages/pettyCashPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('pages/transactionsPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      },
      {
        path: 'actions',
        name: 'actions',
        component: () => import('pages/actionsPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      },
      {
        path: 'myTransactions',
        name: 'myTransactions',
        component: () => import('pages/myTransactionsPage.vue'),
        beforeEnter: (to, from) => isProjectContributor(to, from)
      },
      {
        path: 'transactions/:budgetCategory',
        component: () => import('pages/transactionsPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      },
      {
        path: 'addTransaction',
        name: 'addTrans',
        component: () => import('src/components/transForm.vue'),
        beforeEnter: (to, from) => isProjectContributor(to, from)
      },
      {
        path: 'access',
        name: 'access',
        component: () => import('pages/accessPage.vue'),
        beforeEnter: (to, from) => isAdmin(to, from)
      }
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
routes.push({
  path: '/:pathMatch(.*)*',
  component: () => import('pages/Error404.vue')
})

export default routes

async function isAdmin (to, from) {
  // if (auth.state.userLoadStatus === false) {
  //   // console.log('awaiting user check')
  //   setTimeout(async () => isAdmin(to, from), 10)
  // } else {
  //   // console.log('user found', auth.state.user.uid)
  //   // console.log(to)
  //   let res = await getDoc(doc(getFirestore(), `/projects/${to.params.id}/contributors/${auth.state.user.uid}`))
  //     .catch(err => {
  //       console.log(err)
  //       return '/login'
  //     })
  //   // console.log(res.exists())
  //   if (res) {
  //     if (!res.exists()) return '/login'
  //     else if (res.get('permission') !== 'admin') return '/dashboard'

  //   }
  // }
  const user = await AuthUser();
if (!user) return { name: 'login'}
  // console.log(`/projects/${to.params.id}/contributors/${user.uid}`)
  
    let res = await getDoc(doc(getFirestore(), `/projects/${to.params.id}/contributors/${user.uid}`))
      .catch(err => {
        console.log(err)
        return { name: 'login'}
      })
    if (!res) return { name: 'dashboard'}
    if (res) {
      if(
        res.get('permission') !== 'admin'
      ) return { name: 'dashboard'}
    }
    return
}

async function isProjectContributor (to, from) {
    const user = await AuthUser();
    if (!user) return { name: 'login'}
    let res = await getDoc(doc(getFirestore(), `/projects/${to.params.id}/contributors/${user.uid}`))
      .catch(err => {
        console.log(err)
        return { name: 'login'}
      })
    console.log(res)
    if (!res) return { name: 'dashboard'}
    if (res) {
      if(
        res.get('permission') !== 'admin' &&
        res.get('permission') !== 'contributor'
      ) return { name: 'dashboard'}
    }
    return
}


async function isLoggedIn (to, from) {
  const user = await AuthUser();
  if (!user) return { name: 'login'}
}

// function isContributor (to, from) {

// }
function AuthUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(getAuth(), (user) => {
      if (!user) {
        resolve(false);
      } else {
        resolve(user);
      }
    });
  });
}