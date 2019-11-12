import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'
// import store from './../store/index.js'
// import auth from './../store/modules/auth.js'
// import projects from './../store/modules/projects.js'

// import firebase from 'firebase/app'
// require('firebase/firestore')

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    // mode: 'history',
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    next()
    // console.log('In nav guard', to, from, auth.state.userLoadStatus)
    // console.log(!to.meta.access && !to.meta.private)
    // if (!to.meta.access && !to.meta.private) {
    //   console.log('navigating to public')
    //   next()
    // } else {
    //   waitForLogin()
    // }
    // function waitForLogin () {
    //   if (auth.state.userLoadStatus === false) {
    //     console.log('awaiting user check')
    //     setTimeout(() => waitForLogin(), 10)
    //     return false
    //   } else {
    //     console.log('user checked')
    //     console.log(auth.state.user.uid)
    //     if (to.meta.private && auth.state.user.uid) {
    //       console.log('navigating to private')
    //       next()
    //     } else if (to.meta.access) {
    //       console.log('navigating to access', to.meta.access)
    //       // console.log(store.context)
    //       // console.log(store.dispatch('fetchProject', { projectId: to.params.id }))
    //       // console.log(projects.actions.fetchProject({ 'projectId': to.params.id }))
    //       // projects.actions.fetchProject({ projectId: to.params.id })
    //       // waitForProject()
    //       console.log(`/projects/${to.params.id}/contributors/${auth.state.user.uid}`)
    //       console.log(auth.state.user.uid)
    //       if (!auth.state.user.uid) {
    //         next('/login')
    //       }
    //       firebase.firestore().doc(`/projects/${to.params.id}/contributors/${auth.state.user.uid}`).get().then(res => {
    //         let data = res.data()
    //         if (!res.exists) {
    //           console.log("contributor file doesn't exists")
    //           if (to.name !== 'login') {
    //             console.log(to.name !== 'login', 'redirecting to: ', '/login?signInSuccessUrl=' + to.path)
    //             next('/login?signInSuccessUrl=' + to.path)
    //           } else {
    //             console.log(to.name !== 'login', 'redirecting to: ', '/login')
    //             next('/login')
    //           }
    //         } else if (to.meta.access.admin && (data.permission === 'admin')) {
    //           console.log('admin access')
    //           next()
    //         } else if (to.meta.access.contributor && (data.permission === 'contributor')) {
    //           console.log('contributor access')
    //           next()
    //         } else {
    //           console.log('else')
    //           next('/dashboard')
    //         }
    //         console.log(data.permission)
    //       }).catch(err => {
    //         console.log(err)
    //       })
    //       // console.log(to.meta.access)
    //       // console.log(projects.getters.isAdmin(), projects.getters.isContributor())
    //       // next()
    //     } else {
    //       if (to.name !== 'login') {
    //         console.log(to.name !== 'login', 'redirecting to: ', '/login?signInSuccessUrl=' + to.path)
    //         next('/login?signInSuccessUrl=' + to.path)
    //       } else {
    //         console.log(to.name !== 'login', 'redirecting to: ', '/login')
    //         next('/login')
    //       }
    //     }
    //     return true
    //  }
    // }
    // function waitForProject () {
    //   if (!projects.state.project.id) {
    //     console.log('awaiting project', projects.state.project.id)
    //     setTimeout(() => waitForProject(), 10)
    //     return false
    //   } else {
    //     console.log('project found')
    //     console.log(projects.getters.isAdmin(), projects.getters.isContributor())
    //   }
    // }
  })

  // function isContributor (to, from, next) {

  // }

  // function isAdmin (to, from, next) {

  // }

  return Router
}
