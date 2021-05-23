<template>
  <div>
    <el-form :model="editingWorkflow" label-width="80px">
      <el-form-item label="Name">
        <el-input v-model="editingWorkflow.name" placeholder="input the name of this workflow"></el-input>
      </el-form-item>
      <el-form-item label="Color">
        <el-color-picker v-model="editingWorkflow.themeColor" size="small"/>
      </el-form-item>
      <el-form-item label="Icon">
        <el-radio-group :fill="editingWorkflow.themeColor" v-model="editingWorkflow.themeIcon" size="small">
          <el-radio-button label="el-icon-s-opportunity"><i class="el-icon-s-opportunity"/></el-radio-button>
          <el-radio-button label="el-icon-s-help"><i class="el-icon-s-help"/></el-radio-button>
          <el-radio-button label="el-icon-message-solid"><i class="el-icon-message-solid"/></el-radio-button>
          <el-radio-button label="el-icon-s-flag"><i class="el-icon-s-flag"/></el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Project">
        <el-select disabled v-model="editingWorkflow.projectId" placeholder="select the project which this workflow is belong to">
          <el-option v-for="item in $store.state.securityContext.projectRoles"
                     :key="item.projectId" :label="item.projectName" :value="item.projectId">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onSaveWorkflow">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client, stateCategories } from '../../flywheel'

export default {
  name: 'WorkflowEditingForm',
  props: {
    selectedProjectId: null,
    editingWorkflowId: null
  },
  data () {
    return {
      stateCategories: stateCategories,
      editingWorkflow: {
        name: '',
        projectId: this.selectedProjectId,
        themeColor: '',
        themeIcon: ''
      },
      states: [],
      transitions: [],
      actionResult: null
    }
  },
  mounted () {
    const vue = this
    const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
    client.detailWorkflow(this.editingWorkflowId).then((resp) => {
      vue.editingWorkflow = resp
      vue.states = resp.stateMachine.states
      vue.transitions = resp.stateMachine.transitions
    }).catch((error) => {
      vue.$notify.error({ title: 'Error', message: 'request failed: ' + error })
    }).finally(() => {
      mask.close()
    })
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },
    onSaveWorkflow () {
      if (!this.editingWorkflow || !this.editingWorkflow.name || !this.editingWorkflow.projectId) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.updateWorkflowBase(this.editingWorkflowId, {
        name: this.editingWorkflow.name,
        themeColor: this.editingWorkflow.themeColor,
        themeIcon: this.editingWorkflow.themeIcon ? this.editingWorkflow.themeIcon : 'el-icon-s-opportunity'
      }).then((resp) => {
        vue.actionResult = resp
      }).catch((error) => {
        vue.$notify.error({ title: 'Error', message: 'request failed: ' + error })
      }).finally(() => {
        mask.close()
        vue.$emit('action-result', vue.actionResult)
      })
    }
  }
}
</script>

<style scoped>
  .state-category-stack-1 {
    background-color: #daf3f8;
  }
  .state-category-stack-2 {
    background-color: #fcf7cd;
  }
  .state-category-stack-3 {
    background-color: #e2e2e2;
  }
</style>
