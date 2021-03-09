<template>
  <div>
    <el-form ref="form" :model="creatingWork" label-width="80px">
      <el-form-item label="Name">
        <el-input v-model="creatingWork.name" placeholder="input the name of this workflow"></el-input>
      </el-form-item>
      <el-form-item label="Workflow">
        <workflow-selector :group-id="this.$route.query.projectId" @workflowSelected="onWorkflowSelected"/>
      </el-form-item>
      <el-form-item label="Project">
        <el-select disabled v-model="creatingWork.groupId" placeholder="select the project which this workflow is belong to">
          <el-option v-for="item in $store.state.securityContext.groupRoles"
                     :key="item.groupId" :label="item.groupName" :value="item.groupId">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onCreateWork">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import WorkflowSelector from '../workflow/WorkflowSelector'

export default {
  name: 'WorkCreatingForm',
  components: {
    WorkflowSelector
  },
  props: {
    selectedProjectId: null
  },
  data () {
    return {
      creatingWork: {
        name: '',
        groupId: this.selectedProjectId,
        workflow: {}
      },
      actionResult: null
    }
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },
    onWorkflowSelected (val) {
      this.creatingWork.workflow = val
    },
    onCreateWork () {
      if (!this.creatingWork || !this.creatingWork.name || !this.creatingWork.groupId || !this.creatingWork.workflow || !this.creatingWork.workflow.id) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createWork({ name: this.creatingWork.name, groupId: this.creatingWork.groupId, flowId: this.creatingWork.workflow.id }).then(work => {
        vue.creatingResult = work
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '创建失败' + error })
      }).finally(() => {
        mask.close()
        vue.$emit('action-result', vue.creatingResult)
      })
    }
  }
}
</script>

<style scoped>
</style>
