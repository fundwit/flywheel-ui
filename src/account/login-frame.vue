<template>
  <div>
    <div>
      <login-internal v-if="currentChannel === 'internal'" @loginSuccess="onLoginSuccess"/>
      <login-wechat v-if="currentChannel === 'wechat'" @loginSuccess="onLoginSuccess"/>
    </div>
    <el-divider>sign in channels</el-divider>
    <div>
      <el-radio-group v-model="currentChannel">
        <el-radio :label="c.name" v-for="c in enabledChannels" :key="c.name">{{c.title}}</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import LoginInternal from './login-internal.vue'
import LoginWechat from './login-wechat.vue'
import _ from 'lodash'

export default {
  name: 'LoginFrame',
  components: {
    LoginInternal,
    LoginWechat
  },
  data () {
    return {
      currentChannel: 'internal',
      channels: [
        { name: 'internal', title: 'Username & Password', enabled: true },
        { name: 'wechat', title: 'Wechat', enabled: false }
      ]
    }
  },
  computed: {
    enabledChannels () {
      return _.filter(this.channels, c => c.enabled)
    }
  },
  methods: {
    onLoginSuccess (d) {
      this.$emit('loginSuccess', d)
    }
  }
}
</script>

<style scoped>
</style>
