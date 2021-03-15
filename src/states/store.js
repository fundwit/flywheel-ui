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
    currentGroupId: null,

    defaultGroupId: null,
    isAuthenticated: false,
    securityContext: {
      identity: { },
      perms: [],
      groupRoles: [],
      token: null
    }
  },
  mutations: {
    [statesConst.currentGroupId] (state, groupId) {
      state.currentGroupId = groupId
    },

    [statesConst.mutateSecurityContext] (state, secCtx) {
      if (!secCtx || !secCtx.identity || !secCtx.identity.id || !secCtx.identity.name) {
        state.securityContext = {
          identity: { },
          perms: [],
          groupRoles: [],
          token: null
        }
        state.isAuthenticated = false
        state.defaultGroupId = null
        return
      }

      state.securityContext = secCtx
      state.isAuthenticated = true
      if (secCtx.groupRoles && secCtx.groupRoles.length > 0) {
        state.defaultGroupId = secCtx.groupRoles[0].groupId
      }
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
    store.commit(statesConst.mutateSecurityContext, {
      identity: { },
      perms: [],
      groupRoles: [],
      token: null
    })
    store.commit(statesConst.currentGroupId, null)
  }
  return Promise.reject(err)
})

export default store
