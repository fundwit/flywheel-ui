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

      <div>properties</div>
      <span v-if="!workflow">Loading properties...</span>
      <property-definition-list v-else :workflowId="workflow.id" style="margin-left: 5%; margin-right: 5%"/>

      <el-divider/>
      <div>states</div>
      <span v-if="!workflow">Loading states...</span>
      <state-machine-detail v-else :id="workflow.id" :initial-state-machine="workflow.stateMachine"/>
    </div>
  </el-card>
</template>

<script>
import client from '../flywheel'
import { categoryStyle } from '../themes'
import WorkflowDelete from '../components/workflow/WorkflowDelete'
import StateMachineDetail from '../components/statemachine/StateMachineDetail'
import PropertyDefinitionList from '../components/property-definition/property-definition-list.vue'
import statesConst from '../states/statesConst'
export default {
  name: 'WorkflowDetail',
  components: {
    WorkflowDelete,
    StateMachineDetail,
    PropertyDefinitionList
  },
  data () {
    return {
      id: 0,
      workflow: null
    }
  },
  mounted () {
    this.$store.commit(statesConst.currentProjectId, null)
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
        this.$store.commit(statesConst.currentProjectId, vue.workflow.projectId)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onWorkflowDeleted (deletedWorkflow) {
      if (deletedWorkflow) {
        this.$router.push({ name: 'WorkflowList', query: { projectId: deletedWorkflow.projectId } })
      }
    }
  }
}
</script>

<style scoped>
</style>
