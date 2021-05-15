<template>
  <div>
    User Home
    <el-button type="primary" size="mini" @click="onChangePasswordDialog" icon="el-icon-circle-plus-outline">修改密码</el-button>

    <el-dialog v-if="showChangePasswordDialog === true" title="Change Password" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <user-password-change @action-result="onChangePasswordResult"/>
    </el-dialog>

  </div>
</template>

<script>
import UserPasswordChange from './UserPasswordChange'
export default {
  name: 'UserHome',
  components: {
    UserPasswordChange
  },
  data () {
    return {
      showChangePasswordDialog: false
    }
  },
  methods: {
    onChangePasswordDialog () {
      this.showChangePasswordDialog = true
    },
    onChangePasswordResult (result) {
      this.showChangePasswordDialog = false
    }
  }
}
</script>

<style scoped>
</style>
