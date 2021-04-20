<template>
  <div id="app">
    <div id="nav">
      <el-row>
        <el-col :span="10">
          <a style="color: dodgerblue"><i class="el-icon-loading"/> FlyWheel</a>
          <span v-if="$store.state.isAuthenticated">
            <el-divider direction="vertical"/>
            <span> <i class="el-icon-folder-opened"/> Project </span>
            <el-select size="mini" :value="projectId" :disabled="!$route.query.projectId" @change="onCurrentProjectChange">
              <el-option
                v-for="item in $store.state.securityContext.groupRoles"
                :key="item.groupId"
                :label="item.groupName"
                :value="item.groupId">
              </el-option>
            </el-select>
          </span>
        </el-col>

        <el-col :span="8">
          <span style="margin: 0 auto" v-if="$store.state.isAuthenticated">
            <router-link :to="{ name: 'WorkBacklog', query: { projectId: projectId }}"><i class="el-icon-s-order"/> Works</router-link>
            <el-divider direction="vertical"/>
            <router-link :to="{ name: 'Board', query: { projectId: projectId } }"><i class="el-icon-data-analysis"/> Board</router-link>
            <el-divider direction="vertical"/>
            <router-link :to="{ name: 'WorkflowList', query: { projectId: projectId } }"><i class="el-icon-share"/> Workflows</router-link>
          </span>
        </el-col>

        <el-col :span="6">
          <span style="float: right" v-if="$store.state.isAuthenticated">
            <span><i class="el-icon-user"/> {{$store.state.securityContext.identity.name}}</span>
            <el-divider direction="vertical"/>
            <a href="javascript:void(0)" @click="onLogout"><i class="el-icon-switch-button"/> logout</a>
          </span>
        </el-col>
      </el-row>
    </div>

    <Intro v-if="!$store.state.isAuthenticated && !isLoading"/>
    <GroupGuide v-if="$store.state.isAuthenticated && (!$store.state.securityContext.groupRoles || $store.state.securityContext.groupRoles.length === 0)"/>
    <router-view :class="{hidden: !$store.state.isAuthenticated }"/>
  </div>
</template>

<script>
import client from './flywheel'
import statesConst from './states/statesConst'
import Intro from '@/components/Intro.vue'
import GroupGuide from './components/GroupGuide.vue'
import _ from 'lodash'

export default {
  name: 'App',
  components: {
    Intro,
    GroupGuide
  },
  data () {
    return {
      isLoading: true
    }
  },
  computed: {
    projectId () {
      if (this.$route.query.projectId) {
        return this.$route.query.projectId
      } else {
        return this.$store.state.currentGroupId
      }
    }
  },
  mounted () {
    this.authWithLastToken()
  },
  methods: {
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
    onCurrentProjectChange (val) {
      this.$router.push({ name: this.$route.name, query: { projectId: val } })
    },
    redirectToAvailedProject (route) {
      if (this.$route.query.projectId !== '' && _.includes(['WorkBacklog', 'Board', 'WorkflowList'], this.$route.name)) {
        if (!_.find(this.$store.state.securityContext.groupRoles, i => i.groupId === route.query.projectId)) {
          if (this.$store.state.securityContext.groupRoles.length > 0) {
            this.$router.replace({ name: route.name, query: { projectId: this.$store.state.defaultGroupId } })
          } else {
            this.$router.replace({ name: route.name, query: { projectId: '' } })
          }
        }
      }
    },
    authWithLastToken () {
      const vue = this
      if (!this.$store.state.isAuthenticated) {
        const mask = this.$loading({ lock: true, text: 'Authenticating', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
        client.queryIdentity().then(secCtx => {
          vue.$store.commit(statesConst.mutateSecurityContext, secCtx)
          vue.redirectToAvailedProject(vue.$route)
        }).catch(() => {
          console.log('no valid token, login is required')
        }).finally(() => {
          mask.close()
          this.isLoading = false
        })
      } else {
        vue.redirectToAvailedProject(vue.$route)
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
</style>
