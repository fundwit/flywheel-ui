<template>
  <div>
    <el-form ref="form" :model="creatingWork" label-width="100px">
      <el-form-item label="Name">
        <el-input v-model="creatingWork.name" placeholder="input the name of this workflow"></el-input>
      </el-form-item>
      <el-form-item label="Project">
        <el-select disabled v-model="creatingWork.projectId" placeholder="select the project which this workflow is belong to">
          <el-option v-for="item in $store.state.securityContext.projectRoles"
                     :key="item.projectId" :label="item.projectName" :value="item.projectId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Workflow">
        <workflow-selector :project-id="this.$route.query.projectId" @workflowSelected="onWorkflowSelected"/>
      </el-form-item>
      <el-form-item label="Initial State">
        <span v-if="creatingWork.workflow && creatingWork.workflow.id">
          <span>Selected: </span>
          <span v-if="!creatingWork.initialState">未选择</span>
          <el-tag v-if="creatingWork.initialState" :type="categoryStyle(creatingWork.initialState.category).style" size="small" effect="dark" class="state-list-item">
            {{ creatingWork.initialState.name }}
          </el-tag>
          <WorkflowStateSelector :workflow-id="creatingWork.workflow.id" :category-filters="[1,2]" @workflowStateSelected="initialWorkflowState"/>
        </span>
        <span v-if="!creatingWork.workflow || !creatingWork.workflow.id">select workflow first</span>
      </el-form-item>
      <el-form-item label="Priority">
        <el-radio-group v-model="creatingWork.priorityLevel" size="mini">
          <el-radio-button :label=-1>Highest</el-radio-button>
          <el-radio-button :label=1>Lowest</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onCreateWork">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import { categoryStyle } from '../../themes'
import WorkflowSelector from '../workflow/WorkflowSelector'
import WorkflowStateSelector from '../workflow/WorkflowStateSelector'

export default {
  name: 'WorkCreatingForm',
  components: {
    WorkflowSelector,
    WorkflowStateSelector
  },
  props: {
    selectedProjectId: null
  },
  data () {
    return {
      creatingWork: {
        name: '',
        projectId: this.selectedProjectId,
        workflow: {},

        initialState: null,
        priorityLevel: -1
      },
      actionResult: null
    }
  },
  methods: {
    categoryStyle: categoryStyle,
    onCancel () {
      this.$emit('action-result', null)
    },
    onWorkflowSelected (val) {
      this.$set(this.creatingWork, 'workflow', val)
    },
    onCreateWork () {
      if (!this.creatingWork || !this.creatingWork.name || !this.creatingWork.projectId || !this.creatingWork.workflow || !this.creatingWork.workflow.id) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createWork({
        name: this.creatingWork.name,
        projectId: this.creatingWork.projectId,
        flowId: this.creatingWork.workflow.id,
        initialStateName: this.creatingWork.initialState.name,
        priorityLevel: this.creatingWork.priorityLevel
      }).then(work => {
        vue.creatingResult = work
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '创建失败' + error })
      }).finally(() => {
        mask.close()
        vue.$emit('action-result', vue.creatingResult)
      })
    },
    initialWorkflowState (selectedState) {
      this.creatingWork.initialState = selectedState
    }
  }
}
</script>

<style scoped>
</style>
