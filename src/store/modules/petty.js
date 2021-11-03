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
  pettyTotals: state => {
    let credits = 0
    let debits = 0
    for (var transKey in state.transactions) {
      let transaction = state.transactions[transKey]
      if (transaction.category === 'credit') {
        credits += transaction.amountAUD
      } else if (transaction.category === 'debit') {
        debits += transaction.amountAUD
      }
    }
    return debits - credits
  },
  dollars: state => {
    return state.petty.dollars ? state.petty.dollars : {}
  },
  cents: state => {
    return state.petty.cents ? state.petty.cents : {}
  }
}

export const mutations = {
  setPetty (state, payload) {
    console.log(payload)
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
  setPettyKey (state, payload) {
    state.petty[payload.key] = payload.val
  }
}

export const actions = {
  updatePettyByKey ({ commit }, payload) {
    commit('setPettyKey', payload)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
