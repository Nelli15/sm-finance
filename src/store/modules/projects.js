import firebase from 'firebase/app'
require('firebase/firestore')

const state = {
  project: {},
  projects: []
}

export const getters = {
  project: state => state.project,
  projects: state => state.projects
}

export const mutations = {
  setProject (state, payload) {
    state.project = payload
  },
  setProjects (state, payload) {
    state.projects = payload
  }
}

export const actions = {
  fetchProject ({ commit }, payload) {
    firebase.firestore().doc(`/projects/${payload}`)
      .onSnapshot(async projectSnap => {
        commit('setProject', projectSnap.data())
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
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
