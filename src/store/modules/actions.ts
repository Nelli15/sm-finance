import { getFirestore, onSnapshot, collection, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { Commit } from 'vuex'
interface Action{
  label: string
  [key: string]: any
}
interface State{
  actions: Record<Action['id'], Action>
}
const state = {
  actions: {}
}

export const getters = {
  actions: (state: State) => {
    return state.actions
  },
  actionOptions: (state: State) => {
    let actionOptions: Action[] = Object.values(state.actions)
    return actionOptions.sort((a, b) => (a.label > b.label ? 1 : -1))
  },
}

export const mutations = {
  setActions (state: State, actions: Record<Action['id'], Action>) {
    state.actions = actions
  },
  setActionKey(state: State, {id, key, val}: {id: string, key: string, val: any}) {
      state.actions[id][key] = val
  },
}

export const actions = {
  fetchActions({ commit }: { commit: Commit }, projectId: string) {
      onSnapshot(collection(getFirestore(), `/projects/${projectId}/actions`),async actionsSnap => {
        // console.log('action updated')
        let actions: Record<Action['id'], Action> = {}
        let promises = actionsSnap.docs.map(async (doc: any) => {
          let action: Action = doc.data()
          action.id = doc.id
          return actions[action.id] = action
        })
        await Promise.all(promises)
        if(!actions) return 
        commit('setActions', actions)
      })
  },
  updateActionByKey({ commit }: { commit: Commit }, {id, key, val}: {id: string, key: string, val: any}) {
    commit('setActionKey', {id, key, val})
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
