<template>
  <div id="app">
    <div id="nav">
      <a style="color: dodgerblue">FlyWheel</a>
      <router-link to="/">Home</router-link>
      <router-link to="/board">Board</router-link>
      <span>Is Authenticated: {{$store.state.isAuthenticated}}, current user: {{$store.state.securityContext.principal.name}}</span>
    </div>
    <Intro v-if="!$store.state.isAuthenticated && !isLoading"/>
    <router-view :class="{hidden: !$store.state.isAuthenticated}"/>
  </div>
</template>

<script>
import client from './flywheel'
import statesConst from './states/statesConst'
import Intro from '@/components/Intro.vue'

export default {
  name: 'App',
  components: {
    Intro
  },
  data () {
    return {
      isLoading: true
    }
  },
  mounted () {
    this.authWithLastToken()
  },
  methods: {
    authWithLastToken () {
      if (!this.$store.state.isAuthenticated) {
        const vue = this
        const mask = this.$loading({ lock: true, text: 'Authenticating', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
        client.queryIdentity().then(data => {
          vue.$store.commit(statesConst.mutateSecurityContext, { principal: data })
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
  font-weight: bold;
  color: #2c3e50;
  padding-right: 10px;
  display: inline-block;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
