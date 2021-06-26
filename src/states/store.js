import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import statesConst from './statesConst'
import axios from 'axios'
import _ from 'lodash'
import flywheel from '../flywheel'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  strict: debug,
  plugins: debug ? [createLogger] : [],

  state: {
    currentProject: {
      id: null,
      name: null,
      role: null
    },

    isAuthenticated: false,
    securityContext: {
      identity: { },
      perms: [],
      projectRoles: [],
      token: null
    }
  },
  mutations: {
    [statesConst.currentProjectId] (state, projectId) {
      const projectRole = _.find(state.securityContext.projectRoles, pr => pr.projectId === projectId)
      if (projectRole) {
        state.currentProject = {
          projectId: projectRole.projectId,
          projectName: projectRole.projectName,
          role: projectRole.role
        }
      } else {
        state.currentProject = {
          projectId: null,
          projectName: null,
          role: null
        }
      }
      console.log(`current project is "${state.currentProject.projectName}"`)
    },

    [statesConst.mutateSecurityContext] (state, secCtx) {
      if (!secCtx || !secCtx.identity || !secCtx.identity.id || !secCtx.identity.name) {
        state.securityContext = {
          identity: { },
          perms: [],
          projectRoles: [],
          token: null
        }
        state.isAuthenticated = false
        return
      }

      secCtx.identity.displayName = secCtx.identity.nickname ? secCtx.identity.nickname : secCtx.identity.name
      state.securityContext = secCtx
      state.isAuthenticated = true

      if (!state.currentProject.projectId && secCtx.projectRoles && secCtx.projectRoles.length > 0) {
        if (secCtx.currentProjectId) {
          const projectRole = _.find(state.securityContext.projectRoles, pr => pr.projectId === secCtx.currentProjectId)
          if (projectRole) {
            state.currentProject = {
              projectId: projectRole.projectId,
              projectName: projectRole.projectName,
              role: projectRole.role
            }
          }
        }

        if (!state.currentProject.projectId) {
          const defaultProject = secCtx.projectRoles[0]
          state.currentProject = {
            projectId: defaultProject.projectId,
            projectName: defaultProject.projectName,
            role: defaultProject.role
          }
        }

        console.log(`current project reset to ${state.currentProject.projectName}`)
      }
    }
  },

  // async dispatch
  actions: {
    [statesConst.updateSecurityContext] (context) {
      flywheel.detailSession().then(sec => {
        context.commit(statesConst.mutateSecurityContext, sec)
      }).catch((err) => {
        console.log('unauthenticated: ' + err)
        context.commit(statesConst.mutateSecurityContext, null)
      })
    }
  },

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
      projectRoles: [],
      token: null
    })
    store.commit(statesConst.currentProjectId, null)
  }
  return Promise.reject(err)
})

export default store
