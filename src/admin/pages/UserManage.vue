<template>
  <div>
    User Manage

    <el-button type="primary" size="mini" @click="onCreateUserDialog" icon="el-icon-circle-plus-outline">添加用户</el-button>
    <el-table :data="users" style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="200">
      </el-table-column>
      <el-table-column
        prop="name"
        label="Name">
      </el-table-column>
    </el-table>

    <el-dialog v-if="showUserCreatingDialog === true" title="Create User" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <user-creation @action-result="onUserCreationResult"/>
    </el-dialog>
  </div>
</template>

<script>
import client from '../../flywheel'
import UserCreation from '../components/UserCreation'

export default {
  name: 'UserManage',
  components: {
    UserCreation
  },
  data () {
    return {
      users: [],
      showUserCreatingDialog: false
    }
  },
  mounted () {
    this.loadUsers()
  },
  methods: {
    loadUsers () {
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryUsers().then(resp => {
        vue.users = resp.data
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onCreateUserDialog () {
      this.showUserCreatingDialog = true
    },
    onUserCreationResult (result) {
      this.showUserCreatingDialog = false
      if (result) {
        this.loadUsers()
      }
    }
  }
}
</script>

<style scoped>
</style>
