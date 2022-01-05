import { Transaction } from "src/services/transaction"
import { Commit } from "vuex"

interface Dollars {
  hundreds: number
  fifties: number
  twenties: number
  tens: number
  fives: number
  twos: number
  ones: number
  [key: string]: number
}
interface Cents {
  fifties: number
  twenties: number
  tens: number
  fives: number
  [key: string]: number
}
interface Petty{
    dollars: Dollars
    cents: Cents
    [key: string]: Dollars | Cents
}
interface State{
  petty: Petty
  transactions: {
    [key: string]: Transaction
  }
}
const state = {
  petty: {
    dollars: {
      hundreds: 0,
      fifties: 0,
      twenties: 0,
      tens: 0,
      fives: 0,
      twos: 0,
      ones: 0
    },
    cents: {
      fifties: 0,
      twenties: 0,
      tens: 0,
      fives: 0,
    }
  },
  transactions: {}
}

export const getters = {
  dollars: (state: State) => {
    return state.petty.dollars ? state.petty.dollars : {}
  },
  cents: (state: State) => {
    return state.petty.cents ? state.petty.cents : {}
  }
}

export const mutations = {
  setPetty (state: State, payload: Petty) {
    state.petty = payload ? payload : {
      dollars: {
        hundreds: 0,
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
        twos: 0,
        ones: 0
      },
      cents: {
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
      }
    }
  },
  setPettyKey (state: State, {key, val}: {key: string, val: Dollars | Cents}) {
    state.petty[key] = val
  }
}

export const actions = {
  updatePettyByKey ({ commit }: { commit: Commit }, {key, val}: {key: string, val: Dollars | Cents}) {
    commit('setPettyKey', {key, val})
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
