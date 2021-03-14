<template>
    <el-row style="background-color: darkseagreen">
      <el-col :span="16" style="padding: 5em">
        <div style="font-size: 2.5em">FlyWheel - light weight work flow</div>
      </el-col>
      <el-col :span="8" style="padding: 5em">
        <el-form label-width="80px" :model="loginForm">
          <el-form-item label="用户名">
            <el-input v-model="loginForm.name"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input show-password v-model="loginForm.password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button autofocus type="primary" @click="onInternalSignIn">Sign In</el-button>
          </el-form-item>
        </el-form>

      </el-col>
    </el-row>
</template>

<script>
import client from '../flywheel'
import statesConst from '../states/statesConst'

export default {
  name: 'Intro',
  components: {
  },
  data () {
    return {
      loginForm: {
        name: '',
        password: ''
      }
    }
  },
  methods: {
    onInternalSignIn () {
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Logging', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.login(this.loginForm).then(secCtx => {
        vue.$store.commit(statesConst.mutateSecurityContext, secCtx)
        this.$router.push({ name: 'WorkBacklog', query: { projectId: vue.$store.state.defaultGroupId } })
      }).catch(error => {
        console.log(error)
        this.$notify.error({ title: 'Error', message: 'failed to login' })
      }).finally(() => {
        mask.close()
      })
    },
    onExternalSignIn () {
      // redirect to hallo.fundwit.com and redirect back after auth
      window.location.href = 'http://localhost:8081/login?url=' + window.location.href
    }
  }
}

</script>
