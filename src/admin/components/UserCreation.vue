<template>
  <div>
    <el-form ref="form" :model="userCreation" label-width="200px">
      <el-form-item label="Login">
        <el-input v-model="userCreation.name"></el-input>
      </el-form-item>
      <el-form-item label="Password">
        <el-input show-password v-model="userCreation.secret"></el-input>
      </el-form-item>
      <el-form-item label="Confirm Password">
        <el-input show-password v-model="userCreation.secretConfirm"></el-input>
      </el-form-item>
      <el-form-item label="Nickname">
        <el-input v-model="userCreation.nickname"></el-input>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onUserCreating">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'UserCreation',

  data () {
    return {
      userCreation: {
        name: '',
        secret: '',
        secretConfirm: '',
        nickname: ''
      },
      actionResult: null
    }
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },
    onUserCreating () {
      if (!this.userCreation || !this.userCreation.name || !this.userCreation.secret || this.userCreation.secret !== this.userCreation.secretConfirm) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createUser({
        name: this.userCreation.name,
        secret: this.userCreation.secret,
        nickname: this.userCreation.nickname
      }).then((resp) => {
        vue.actionResult = resp
        this.$emit('action-result', vue.actionResult)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error })
      }).finally(() => {
        mask.close()
      })
    }
  }
}
</script>

<style scoped>
</style>
