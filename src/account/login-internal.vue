<template>
  <div>
    <el-form label-width="80px" :model="loginForm">
      <el-form-item label="用户名">
        <el-input v-model="loginForm.name" @keyup.enter.native="onInternalSignIn"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input show-password v-model="loginForm.password" @keyup.enter.native="onInternalSignIn"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onInternalSignIn" @keyup.enter.native="onInternalSignIn">Sign In</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import client from '../flywheel'
import statesConst from '../states/statesConst'

export default {
  name: 'LoginInternal',
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
      client.login(this.loginForm).then(secCtx => {
        this.$store.commit(statesConst.mutateSecurityContext, secCtx)
        this.$emit('loginSuccess', secCtx)
      }).catch(error => {
        console.log(error)
        this.$notify.error({ title: 'Error', message: 'failed to login' })
      })
    },
    onExternalSignIn () {
      // redirect to hallo.fundwit.com and redirect back after auth
      window.location.href = 'http://localhost:8081/login?url=' + window.location.href
    }
  }
}
</script>

<style scoped>
</style>
