import { getFirestore, onSnapshot, query, where, collection } from 'firebase/firestore'

const state = {
  actions: {},
  listeners: []
}

export const getters = {
  actions: state => {
    return state.actions
  },
  actionOptions: state => {
    let actionOptions = Object.values(state.actions)
    return actionOptions.sort((a, b) => (a.label > b.label ? 1 : -1))
  },
}

export const mutations = {
  setActions (state, payload) {
    state.actions = payload
  },
  setActionKey(state, payload) {
    
      state.actions[payload.id][payload.key] = payload.val
  },
  addListeners(state, unsub) {
    state.listeners.push(unsub)
  },
  clearListeners(state, {}) {
    
    // for(let unsub of state.listeners){
    //   unsub()
    // }
    // state.listeners = []
  }
}

export const actions = {
  fetchActions({ commit }, payload) {
    commit('clearListeners', false)
      let unsub = onSnapshot(collection(getFirestore(), `/projects/${payload}/actions`),async actionsSnap => {
        // console.log('action updated')
        let actions = {}
        let promises = actionsSnap.docs.map(async doc => {
          let action = doc.data()
          action.id = doc.id
          return actions[action.id] = action
        })
        await Promise.all(promises)
        commit('setActions', actions)
      })
      commit('addListeners', unsub)
  },
  updateActionByKey({ commit }, payload) {
    commit('setActionKey', payload)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
