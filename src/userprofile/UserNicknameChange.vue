<template>
  <div>
    <el-form ref="form" label-width="200px">
      <el-form-item label="Nickname">
        <el-input v-model="nickname"></el-input>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onSubmit">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../flywheel'
import statesConst from '../states/statesConst'

export default {
  name: 'UserNicknameChange',
  props: {
    originNickname: null
  },
  data () {
    return {
      nickname: this.originNickname,
      actionResult: null
    }
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },
    onSubmit () {
      if (!this.nickname) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const secCtx = this.$store.state.securityContext
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.updateUser(secCtx.identity.id, { nickname: this.nickname }).then(() => {
        secCtx.identity.nickname = this.nickname
        this.$store.commit(statesConst.mutateSecurityContext, secCtx)

        this.actionResult = { nickname: this.nickname }
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error })
      }).finally(() => {
        mask.close()
        this.$emit('action-result', this.actionResult)
      })
    }
  }
}
</script>

<style scoped>
</style>
