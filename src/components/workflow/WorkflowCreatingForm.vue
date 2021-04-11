<template>
  <div>
    <el-form ref="form" :model="creatingWorkflow" label-width="80px">
      <el-form-item label="Name">
        <el-input v-model="creatingWorkflow.name" placeholder="input the name of this workflow"></el-input>
      </el-form-item>
      <el-form-item label="Color">
        <el-color-picker v-model="creatingWorkflow.themeColor" size="small"/>
      </el-form-item>
      <el-form-item label="Icon">
        <el-radio-group :fill="creatingWorkflow.themeColor" v-model="creatingWorkflow.themeIcon" size="small">
          <el-radio-button label="el-icon-s-opportunity"><i class="el-icon-s-opportunity"/></el-radio-button>
          <el-radio-button label="el-icon-s-help"><i class="el-icon-s-help"/></el-radio-button>
          <el-radio-button label="el-icon-message-solid"><i class="el-icon-message-solid"/></el-radio-button>
          <el-radio-button label="el-icon-s-flag"><i class="el-icon-s-flag"/></el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Project">
        <el-select disabled v-model="creatingWorkflow.groupId" placeholder="select the project which this workflow is belong to">
          <el-option v-for="item in $store.state.securityContext.groupRoles"
                     :key="item.groupId" :label="item.groupName" :value="item.groupId">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>

    <div>state machine</div>
    <state-machine-creating-form @stateMachineUpdated="onStateMachineUpdated"/>

    <el-divider style="margin: 0"/>

    <el-button type="primary" @click="onCreateWorkflow">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client, stateCategories } from '../../flywheel'
import { randomColor } from '../../colors'
import StateMachineCreatingForm from '../statemachine/StateMachineCreatingForm'

export default {
  name: 'WorkflowCreatingForm',
  components: {
    StateMachineCreatingForm
  },
  props: {
    selectedProjectId: null
  },
  data () {
    return {
      stateCategories: stateCategories,
      creatingWorkflow: {
        name: '',
        groupId: this.selectedProjectId,
        themeColor: randomColor(),
        themeIcon: ''
      },
      stateMachine: {
        states: [],
        transitions: []
      },
      creatingResult: null
    }
  },
  methods: {
    onStateMachineUpdated (fsm) {
      this.stateMachine = fsm
    },
    onCancel () {
      this.$emit('creating-result', null)
    },

    onCreateWorkflow () {
      if (!this.creatingWorkflow || !this.creatingWorkflow.name || !this.creatingWorkflow.groupId ||
          !this.stateMachine || !this.stateMachine.states || !this.stateMachine.states.length) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createWorkflow({
        name: this.creatingWorkflow.name,
        groupId: this.creatingWorkflow.groupId,
        themeColor: this.creatingWorkflow.themeColor,
        themeIcon: this.creatingWorkflow.themeIcon ? this.creatingWorkflow.themeIcon : 'el-icon-s-opportunity',
        stateMachine: this.stateMachine
      }).then((resp) => {
        vue.creatingResult = resp
      }).catch((error) => {
        vue.$notify.error({ title: 'Error', message: 'request failed: ' + error })
      }).finally(() => {
        mask.close()
        vue.$emit('creating-result', vue.creatingResult)
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
