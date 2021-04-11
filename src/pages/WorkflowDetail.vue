<template>
  <el-card class="box-card" style="width: 80%; margin: 1rem auto">
    <div style="width: 90%; margin: 0 auto;">
      <div>
        <workflow-delete v-if="workflow" :workflow="workflow" @workflowDeleted="onWorkflowDeleted"/>
      </div>
      <div>
        {{id}}
        <div v-if="workflow">
          <el-tag size="small" :style="{ backgroundColor: workflow.themeColor }" effect="dark">
            <i :class="workflow.themeIcon ? workflow.themeIcon : 'el-icon-s-claim'"/>  {{workflow.name}}
          </el-tag>
        </div>
      </div>
      <el-divider/>
      <div>state machine</div>
      <span v-if="!workflow">Loading...</span>
      <state-machine-detail v-if="workflow" :id="workflow.id" :initial-state-machine="workflow.stateMachine"/>
    </div>
  </el-card>
</template>

<script>
import client from '../flywheel'
import { categoryStyle } from '../themes'
import WorkflowDelete from '../components/workflow/WorkflowDelete'
import StateMachineDetail from '../components/statemachine/StateMachineDetail'
import statesConst from '../states/statesConst'
export default {
  name: 'WorkflowDetail',
  components: {
    WorkflowDelete,
    StateMachineDetail
  },
  data () {
    return {
      id: 0,
      workflow: null
    }
  },
  mounted () {
    this.$store.commit(statesConst.currentGroupId, null)
    this.id = this.$route.params.id
    this.loadWorkflowDetail()
  },
  methods: {
    categoryStyle: categoryStyle,
    loadWorkflowDetail () {
      if (!this.id) {
        return
      }
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.detailWorkflow(this.id).then((resp) => {
        vue.workflow = resp
        // vue.statesTransition = _.groupBy(vue.workflow.stateMachine.transitions, transition => transition.from)
        this.$store.commit(statesConst.currentGroupId, vue.workflow.groupId)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onWorkflowDeleted (deletedWorkflow) {
      if (deletedWorkflow) {
        this.$router.push({ name: 'WorkflowList', query: { projectId: deletedWorkflow.groupId } })
      }
    }
  }
}
</script>

<style scoped>
</style>
