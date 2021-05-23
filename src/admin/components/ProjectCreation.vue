<template>
  <div>
    <el-form ref="form" :model="projectCreation" label-width="200px">
      <el-form-item label="Name">
        <el-input v-model="projectCreation.name"></el-input>
      </el-form-item>
      <el-form-item label="Identifier">
        <el-input v-model="projectCreation.identifier"></el-input>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onProjectCreating">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'ProjectCreation',

  data () {
    return {
      projectCreation: {
        name: ''
      },
      actionResult: null
    }
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },
    onProjectCreating () {
      if (!this.projectCreation || !this.projectCreation.name) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createProject({
        name: this.projectCreation.name,
        identifier: this.projectCreation.identifier
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
