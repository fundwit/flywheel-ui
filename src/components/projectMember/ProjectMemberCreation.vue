<template>
  <div>
    <el-form ref="form" :model="projectMemberCreation" label-width="200px">
      <el-form-item label="Member">
        <el-select v-model="projectMemberCreation.memberId">
          <el-option v-for="item in accounts"
                      :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="roles">
        <el-select v-model="projectMemberCreation.role">
          <el-option v-for="item in roles"
                      :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onProjectMemberCreating">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import _ from 'lodash'

export default {
  name: 'ProjectMemberCreation',
  props: {
    projectId: null
  },
  data () {
    return {
      projectMemberCreation: {
        memberId: '',
        role: ''
      },
      accounts: [],
      roles: ['manager', 'common'],
      actionResult: null
    }
  },
  mounted () {
    this.loadAccounts()
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },

    loadAccounts () {
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryUsers().then((resp) => {
        vue.accounts = _.filter(resp.data, a => a.id !== vue.$store.state.securityContext.identity.id)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },

    onProjectMemberCreating () {
      if (!this.projectMemberCreation || !this.projectMemberCreation.memberId || !this.projectMemberCreation.role) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.addProjectMember({
        projectId: this.projectId,
        memberId: this.projectMemberCreation.memberId,
        role: this.projectMemberCreation.role
      }).then(() => {
        vue.actionResult = true
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
