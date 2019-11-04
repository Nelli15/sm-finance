import firebase from 'firebase/app'
require('firebase/firestore')
import Vue from 'vue'

function waitForUid (payload, rootState, dispatch) {
  // console.log('RootState', rootState.auth.user.uid)
  if (!rootState.auth.user.uid) {
    // console.log("uid doesn't exist")
    setTimeout(() => waitForUid(payload, rootState, dispatch), 10)
  } else {
    payload.uid = rootState.auth.user.uid
    dispatch('fetchPermissions', payload)
  }
}

const state = {
  project: {},
  projects: []
}

export const getters = {
  project: state => state.project,
  projects: state => state.projects,
  isAdmin: state => {
    if (state.project) {
      if (state.project.permissions) {
        // console.log('admin?', state.project.permissions.permission)
        return state.project.permissions.permission === 'admin'
      }
    }
    return false
  },
  isContributor: state => {
    if (state.project) {
      if (state.project.permissions) {
        // console.log('contributor?', state.project.permissions.permission)
        return state.project.permissions.permission === 'contributor'
      }
    }
    return false
  },
  contributorBudgets: (state, getters, rootState) => {
    if (state.project) {
      if (state.project.permissions) {
        let budgets = []
        for (var budget in state.project.permissions.budgets) {
          // console.log(getters.budgets)
          // console.log(state.project.permissions.budgets[budget])
          if (getters.budgets[state.project.permissions.budgets[budget]]) {
            budgets.push(getters.budgets[state.project.permissions.budgets[budget]])
          }
        }
        for (budget in state.project.permissions.budgets) {
          // console.log(getters.budgetCategories)
          // console.log(state.project.permissions.budgets[budget])
          if (getters.budgetCategories[state.project.permissions.budgets[budget]]) {
            budgets.push(getters.budgetCategories[state.project.permissions.budgets[budget]])
          }
        }
        return budgets
      }
    }
    return []
  }
}

export const mutations = {
  setProject (state, payload) {
    state.project = payload
  },
  setProjects (state, payload) {
    state.projects = payload
  },
  setPermissions (state, payload) {
    Vue.set(state.project, 'permissions', payload)
  }
}

export const actions = {
  fetchProject ({ dispatch, commit, rootState }, payload) {
    let project = {}
    firebase.firestore().doc(`/projects/${payload.projectId}`)
      .onSnapshot(async projectSnap => {
        project = projectSnap.data()
        project.id = projectSnap.id
        commit('setProject', project)
        waitForUid(payload, rootState, dispatch)
      })
  },
  fetchProjects ({ commit }, payload) {
    // console.log(payload)
    firebase.firestore().collectionGroup('contributors').where('uid', '==', payload)
      .onSnapshot(async projectsSnap => {
        // console.log('# projects', projectsSnap.size)
        let projects = [], project = {}
        var promises = projectsSnap.docs.map(userDoc => {
          return new Promise((resolve, reject) => {
            userDoc.ref.parent.parent.onSnapshot(projectDoc => {
              project = projectDoc.data()
              project.id = projectDoc.id
              project.permission = userDoc.data().permission
              // console.log(project)
              projects.push(project)
              resolve()
            })
          })
        })
        await Promise.all(promises)
        commit('setProjects', projects)
      })
  },
  fetchPermissions ({ commit }, payload) {
    // console.log(payload)
    firebase.firestore().doc(`/projects/${payload.projectId}/contributors/${payload.uid}`)
      .onSnapshot(async contributorSnap => {
        commit('setPermissions', contributorSnap.data())
      })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
