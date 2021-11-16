import { getFirestore, onSnapshot, query, collectionGroup, where, doc } from 'firebase/firestore'

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
  projectsTableKey: 1,
  listeners: []
  // listeners: {
  //   project: [],
  //   projects: [],

  // }
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
          console.log(rootState.budgets.budgets)
          console.log(state.project.permissions.budgets[budget])
          if (rootState.budgets.budgets[state.project.permissions.budgets[budget]]) {
            budgets.push(
              rootState.budgets.budgets[state.project.permissions.budgets[budget]]
            )
          }
        }
        for (budget in state.project.permissions.budgets) {
          // console.log(getters.budgetCategories)
          // console.log(state.project.permissions.budgets[budget])
          if (
            rootState.budgets.budgetCategories[state.project.permissions.budgets[budget]]
          ) {
            budgets.push(
              rootState.budgets.budgetCategories[
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
    state.project = payload
  },
  setProjects (state, payload) {
    // state.projects = payload
    state.projects = payload
  },
  setPermissions (state, payload) {
    state.project = {...state.project, permissions: payload}
  },
  updateProjects (state, payload) {
    // console.log(payload)
    // var elementPos = state.projects.map(function(x) {return x.id; }).indexOf(payload.index);
    // if(elementPos !== -1) {
    //   state.projects.slice(elementPos, 1, payload.project)
    // } else {
    //   state.projects.push(payload.project)
    // }
    state.projects[payload.index] = payload.project
  },
  removeProject (state, id) {
  delete state.projects[id]
  },
  setProjectKey (state, payload) {
    state.project, payload.key, payload.val
    if (state.projects[payload.projectId]) {
      state.projects[payload.projectId], payload.key, payload.val
    }
  },
  addListeners(state, { type, unsub}) {
    state.listeners.push(unsub)
  },
  clearListeners(state, type) {
    
    // for(let unsub of state.listeners[type]){
    //   unsub()
    // }
    // state.listeners.type = []
  }
}

export const actions = {
  fetchProject ({ dispatch, commit, rootState }, payload) {
    // console.log('fetching project')
    let project = {}
      commit('clearListeners', false)
      let unsub = onSnapshot(doc(getFirestore(),`/projects/${payload.projectId}`), async projectSnap => {
        project = projectSnap.data()
        project.id = projectSnap.id
        commit('setProject', project)
        commit('petty/setPetty', project.petty, { root: true })
        waitForUid(payload, rootState, dispatch)
      })
      commit('addListeners', unsub)
  },
  async fetchProjects ({ commit }, payload) {
    // console.log('fetching projects', payload)
      commit('clearListeners', false)
      let unsub = onSnapshot(query(collectionGroup(getFirestore(), 'contributors'), where('uid', '==', payload)), async projectsSnap => {
        // console.log('some error', projectsSnap)
        let projects = [],
          project = {}
          
        var promises = projectsSnap.docChanges().map(userDoc => {
          if (userDoc.type === 'added') {
            userDoc = userDoc.doc
      let unsub = onSnapshot(userDoc.ref.parent.parent, projectDoc => {
            // console.log(projectDoc.data())
            project = projectDoc.data()
            project.id = projectDoc.id
            project.permission = userDoc.data().permission
            commit('updateProjects', {
              index: project.id,
              project
            })
          })
        } else if (userDoc.type === 'removed') {
          // console.log(userDoc.doc.ref.parent.parent)
          // userDoc.ref.parent.parent.get(movementDoc => {
          commit('removeProject', userDoc.doc.ref.parent.parent.id)
          // })
        }

        })
      
      })
      commit('addListeners', {type: 'permission', unsub})
  },
  fetchPermissions ({ commit }, payload) {
    // console.log(payload)
    commit('clearListeners', 'permissions')
      let unsub = onSnapshot(doc(getFirestore(), `/projects/${payload.projectId}/contributors/${payload.uid}`), async contributorSnap => {
        commit('setPermissions', contributorSnap.data())
      })
      commit('addListeners', {type: 'permission', unsub})
  },
  updateProjectByKey ({ commit }, payload) {
    commit('setProjectKey', payload)
  }
}

export default {
  namespaced: true,
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
