<template>
  <div>
    <el-form ref="form" :model="basicAuthChanges" label-width="200px">
      <el-form-item label="Original Password">
        <el-input show-password v-model="basicAuthChanges.originalSecret"></el-input>
      </el-form-item>
      <el-form-item label="New Password">
        <el-input show-password v-model="basicAuthChanges.newSecret"></el-input>
      </el-form-item>
      <el-form-item label="Confirm Password">
        <el-input show-password v-model="basicAuthChanges.newSecretConfirm"></el-input>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onChangePassword">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../flywheel'

export default {
  name: 'UserPasswordChange',

  data () {
    return {
      basicAuthChanges: {
        originalSecret: '',
        newSecret: '',
        newSecretConfirm: ''
      },
      actionResult: null
    }
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },
    onChangePassword () {
      if (!this.basicAuthChanges || !this.basicAuthChanges.newSecret || this.basicAuthChanges.newSecret !== this.basicAuthChanges.newSecretConfirm) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.changePassword({
        originalSecret: this.basicAuthChanges.originalSecret,
        newSecret: this.basicAuthChanges.newSecret
      }).then(() => {
        vue.actionResult = { result: true }
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error })
      }).finally(() => {
        mask.close()
        this.$emit('action-result', null)
      })
    }
  }
}
</script>

<style scoped>
</style>
