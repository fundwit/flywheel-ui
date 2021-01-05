import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import statesConst from './statesConst'
import axios from 'axios'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  strict: debug,
  plugins: debug ? [createLogger] : [],

  state: {
    isAuthenticated: false,
    securityContext: {
      principal: {}
    }
  },

  mutations: {
    [statesConst.mutateSecurityContext] (state, secCtx) {
      if (!secCtx || !secCtx.principal || !secCtx.principal.id || !secCtx.principal.name) {
        state.securityContext = {
          principal: { }
        }
        state.isAuthenticated = false
        return
      }

      state.securityContext = {
        principal: {
          id: secCtx.principal.id,
          name: secCtx.principal.name
        }
      }
      state.isAuthenticated = true
    }
  },

  // async dispatch
  actions: {},

  // sub modules
  modules: {}
})

axios.interceptors.response.use(res => {
  return res
}, err => {
  if (err.response.status === 401) {
    store.commit(statesConst.mutateSecurityContext, { principal: {} })
  }
  return Promise.reject(err)
})

export default store
