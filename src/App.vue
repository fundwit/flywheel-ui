<template>
  <div id="app">
    <div id="nav">
      <el-row>
        <el-col :span="10">
          <a style="color: dodgerblue"><i class="el-icon-loading"/> FlyWheel</a>
          <span v-if="$store.state.isAuthenticated">
            <el-divider direction="vertical"/>
            <span> <i class="el-icon-folder-opened"/> </span>

            <el-dropdown size="mini" trigger="click">
              <span class="el-dropdown-link">
                {{this.$store.state.currentProject.projectName}} <i class="el-icon-arrow-down el-icon--right"/>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in $store.state.securityContext.projectRoles"
                    :key="item.projectId" @click.native="onCurrentProjectChange(item.projectId)">
                  {{item.projectName}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </el-col>

        <el-col :span="8">
          <span style="margin: 0 auto" v-if="$store.state.isAuthenticated">
            <router-link :to="{ name: 'WorkBacklog', query: { projectId: projectId }}"><i class="el-icon-s-order"/> Works</router-link>
            <el-divider direction="vertical"/>
            <router-link :to="{ name: 'Board', query: { projectId: projectId } }"><i class="el-icon-data-analysis"/> Board</router-link>
            <el-divider direction="vertical"/>
            <router-link :to="{ name: 'WorkflowList', query: { projectId: projectId } }"><i class="el-icon-share"/> Workflows</router-link>
            <el-divider direction="vertical"/>
            <router-link :to="{ name: 'ProjectSettingsPage', params: { id: projectId }}"><i class="el-icon-menu"/> Preference</router-link>
          </span>
          <span v-else>Welcome</span>
        </el-col>

        <el-col :span="6">
          <span style="float: right" v-if="$store.state.isAuthenticated">
            <span v-if="$store.state.securityContext.perms.indexOf('system:admin') >= 0">
              <router-link :to="{ name: 'AdminHome'}">
                <i class="el-icon-set-up"/> Admin
              </router-link>
              <el-divider direction="vertical"/>
            </span>

            <router-link :to="{ name: 'UserHome'}">
              <user-avatar :rounded="true" :size="25" style="display: inline-block; margin-bottom: -8px"
                :userId="$store.state.securityContext.identity.id"
                :username="$store.state.securityContext.identity.displayName"/>

              {{$store.state.securityContext.identity.displayName}}
            </router-link>

            <el-divider direction="vertical"/>
            <a href="javascript:void(0)" @click="onLogout"><i class="el-icon-switch-button"/> logout</a>
          </span>
          <span v-else style="float: right">
            <a href="javascript:void(0)" @click="showLoginFrame = true"><i class="el-icon-user"/> Sign in</a>
          </span>
        </el-col>
      </el-row>
    </div>

    <Intro v-if="!$store.state.isAuthenticated && !isLoading"/>
    <ProjectGuide v-if="$store.state.isAuthenticated && (!$store.state.securityContext.projectRoles || $store.state.securityContext.projectRoles.length === 0)"/>
    <router-view :class="{hidden: !$store.state.isAuthenticated }"/>

    <el-dialog title="Sign in" v-if="showLoginFrame" :visible="true" @close="showLoginFrame=false" width="30%" center>
      <login-frame @loginSuccess="onSignIn"/>
    </el-dialog>
  </div>
</template>

<script>
import client from './flywheel'
import statesConst from './states/statesConst'
import Intro from '@/components/Intro.vue'
import ProjectGuide from './components/ProjectGuide.vue'
import _ from 'lodash'
import UserAvatar from './userprofile/UserAvatar.vue'
import LoginFrame from './account/login-frame.vue'

export default {
  name: 'App',
  components: {
    Intro,
    ProjectGuide,
    UserAvatar,
    LoginFrame
  },
  data () {
    return {
      isLoading: true,
      showLoginFrame: false
    }
  },
  computed: {
    projectId () {
      return this.$store.state.currentProject.projectId
    },
    avatarUrl () {
      return client.withPath('/v1/account-avatars/' + this.$store.state.securityContext.identity.id)
    }
  },
  mounted () {
    this.authWithLastToken()
  },
  watch: {
    projectId (val) {
      console.log(`current project id: ${val}`)
      if (_.includes(['WorkBacklog', 'Board', 'WorkflowList'], this.$route.name) && this.$route.query.projectId !== val) {
        this.$router.push({ name: this.$route.name, query: { projectId: val } })
      } else if (_.includes(['ProjectDetail'], this.$route.name) && this.$route.params.id !== val) {
        this.$router.push({ name: this.$route.name, params: { id: val } })
      }
    }
  },
  methods: {
    onSignIn () {
      this.showLoginFrame = false
      this.$router.push({ name: 'Dashboard' })
    },
    onLogout () {
      const mask = this.$loading({ lock: true, text: 'processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.logout().then(() => {
        this.$store.commit(statesConst.mutateSecurityContext, null)
      }).catch(() => {
        console.log('logout failed')
      }).finally(() => {
        mask.close()
      })
    },
    onCurrentProjectChange (projectId) {
      this.$store.commit(statesConst.currentProjectId, projectId)
      // this.$router.push({ name: this.$route.name, query: { projectId: projectId } })
    },
    authWithLastToken () {
      const vue = this
      if (!this.$store.state.isAuthenticated) {
        const mask = this.$loading({ lock: true, text: 'Authenticating', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
        client.queryIdentity().then(secCtx => {
          let currentProjectId = null
          if (_.includes(['WorkBacklog', 'Board', 'WorkflowList'], this.$route.name) && this.$route.query.projectId !== this.$store.state.currentProject.projectId) {
            currentProjectId = this.$route.query.projectId
          } else if (_.includes(['ProjectDetail'], this.$route.name) && this.$route.params.id !== this.$store.state.currentProject.projectId) {
            currentProjectId = this.$route.params.id
          }

          secCtx.currentProjectId = currentProjectId
          vue.$store.commit(statesConst.mutateSecurityContext, secCtx)
        }).catch(() => {
          console.log('no valid token, login is required')
        }).finally(() => {
          mask.close()
          this.isLoading = false
        })
      }
    }
  }
}
</script>
<style>
body {
  margin: 0;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 10px;
  border-bottom: 1px solid #EEEEEE;
}

.hidden {
  display: none;
}

#nav a {
  color: #2c3e50;
  padding-right: 10px;
  display: inline-block;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
.el-tag{
  border-width: 0 !important;
  border-radius: 0 !important;
  line-height: 26px !important;
}
.el-radio-button span {
  border-radius: 0 !important;
}
.active-item {
  cursor: pointer;
}
.fw-dialog .el-dialog__header {
  padding: 0
}
.fw-dialog .el-dialog__body {
  padding: 0
}
.fw-flex {
  display: flex;
  display: -webkit-flex;
  flex-wrap: nowrap;
  align-items: stretch;
}
.fw-flex-v-center {
  align-items: center;
}
.fw-flex-v-top {
  align-items: flex-start;
}
.fw-flex-grow {
  flex-grow: 1;
}
.fw-text-comment {
  font-size: 0.8em;
  color: #999;
}

.state-category-stack-1 {
  background-color: #daf3f8;
  height: 100%;
}
.state-category-stack-2 {
  background-color: #fcf7cd;
  height: 100%;
}
.state-category-stack-3 {
  background-color: #e2e2e2;
  height: 100%;
}

.state-category-theme-dark-1 {
  background-color: skyblue;
  height: 100%;
}
.state-category-theme-dark-2 {
  background-color: orange;
  height: 100%;
}
.state-category-theme-dark-3 {
  background-color: green;
  height: 100%;
}
.state-category-theme-dark-4 {
  background-color: gray;
  height: 100%;
}

.gantt-block-item {
  min-width: 2px;
}
</style>
