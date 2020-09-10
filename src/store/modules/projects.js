import { $firestore } from './../../scripts/firebase.js'
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
  projects: {},
  projectsTableKey: 1
}

export const getters = {
  project: state => state.project,
  projects: state => toArray(state.projects),
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
            budgets.push(
              getters.budgets[state.project.permissions.budgets[budget]]
            )
          }
        }
        for (budget in state.project.permissions.budgets) {
          // console.log(getters.budgetCategories)
          // console.log(state.project.permissions.budgets[budget])
          if (
            getters.budgetCategories[state.project.permissions.budgets[budget]]
          ) {
            budgets.push(
              getters.budgetCategories[
                state.project.permissions.budgets[budget]
              ]
            )
          }
        }
        return budgets
      }
    }
    return []
  },
  projectsTableKey: state => state.projectsTableKey
}

export const mutations = {
  setProject (state, payload) {
    // state.project = payload
    Vue.set(state, 'project', payload)
  },
  setProjects (state, payload) {
    // state.projects = payload
    Vue.set(state, 'projects', payload)
  },
  setPermissions (state, payload) {
    Vue.set(state.project, 'permissions', payload)
  },
  updateProjects (state, payload) {
    Vue.set(state.projects, payload.index, payload.project)
  },
  setProjectKey (state, payload) {
    Vue.set(state.project, payload.key, payload.val)
    if (state.projects[payload.projectId]) {
      Vue.set(state.projects[payload.projectId], payload.key, payload.val)
    }
  }
}

export const actions = {
  fetchProject ({ dispatch, commit, rootState }, payload) {
    console.log('fetching project')
    let project = {}
    $firestore
      .doc(`/projects/${payload.projectId}`)
      .onSnapshot(async projectSnap => {
        project = projectSnap.data()
        project.id = projectSnap.id
        commit('setProject', project)
        commit('setPetty', project.petty)
        waitForUid(payload, rootState, dispatch)
      })
  },
  fetchProjects ({ commit }, payload) {
    // console.log(payload)
    $firestore
      .collectionGroup('contributors')
      .where('uid', '==', payload)
      .onSnapshot(async projectsSnap => {
        let projects = [],
          project = {}
        var promises = projectsSnap.docs.map(userDoc => {
          userDoc.ref.parent.parent.onSnapshot(projectDoc => {
            project = projectDoc.data()
            project.id = projectDoc.id
            project.permission = userDoc.data().permission
            commit('updateProjects', {
              index: project.id,
              project
            })
          })
        })
      })
  },
  fetchPermissions ({ commit }, payload) {
    // console.log(payload)
    $firestore
      .doc(`/projects/${payload.projectId}/contributors/${payload.uid}`)
      .onSnapshot(async contributorSnap => {
        commit('setPermissions', contributorSnap.data())
      })
  },
  updateProjectByKey ({ commit }, payload) {
    commit('setProjectKey', payload)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}

function toArray (object) {
  if (!object) {
    return []
  }
  if (Object.keys(object).length <= 0) {
    return []
  }
  return Object.keys(object).map(i => object[i])
}
