<template>
  <div>
    <el-form ref="form" :model="projectLabelCreation" label-width="200px">
      <el-form-item label="name">
          <el-input v-model="projectLabelCreation.name" placeholder="input the name of this label"></el-input>
      </el-form-item>
      <el-form-item label="themeColor">
        <el-color-picker v-model="projectLabelCreation.themeColor" size="small"/>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onProjectLabelCreating">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import { randomColor } from '../../colors'

export default {
  name: 'ProjectLabelCreation',
  props: {
    projectId: null
  },
  data () {
    return {
      projectLabelCreation: {
        name: '',
        themeColor: randomColor()
      },
      actionResult: null
    }
  },
  mounted () {
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },

    onProjectLabelCreating () {
      if (!this.projectLabelCreation || !this.projectLabelCreation.name || !this.projectLabelCreation.themeColor) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.addProjectLabel({
        projectId: this.projectId,
        name: this.projectLabelCreation.name,
        themeColor: this.projectLabelCreation.themeColor
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
