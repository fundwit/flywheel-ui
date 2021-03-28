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

      <el-button type="primary" size="mini" @click="onCreateWorkflowStateDialog" disabled icon="el-icon-circle-plus-outline">添加状态</el-button>

      <div v-if="workflow && workflow.stateMachine" style="margin: 10px 40px">
        <draggable group="backlog" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass">
          <el-card v-for="state in inBacklogStates" :key="state.name" class="item state-category-stack-1" style="margin: 20px 0; border-radius: 0;">
            <workflow-state-detail :workflow-id="workflow.id" :state="state" :to-states="buildToStates(state)"/>
          </el-card>
        </draggable>

        <el-divider/>
        <draggable group="inProgress" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass">
          <el-card v-for="state in inProgressStates" :key="state.name" class="item state-category-stack-2" style="margin: 20px 0; border-radius: 0">
            <workflow-state-detail :workflow-id="workflow.id" :state="state" :to-states="buildToStates(state)"/>
          </el-card>
        </draggable>

        <el-divider/>
        <draggable group="done" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass">
          <el-card v-for="state in doneStates" :key="state.name" class="item state-category-stack-3" style="margin: 20px 0; border-radius: 0">
            <workflow-state-detail :workflow-id="workflow.id" :state="state" :to-states="buildToStates(state)"/>
          </el-card>
        </draggable>
      </div>
    </div>
  </el-card>
</template>

<script>
import _ from 'lodash'
import client from '../flywheel'
import { categoryStyle } from '../themes'
import WorkflowDelete from '../components/workflow/WorkflowDelete'
import WorkflowStateDetail from '../components/workflow/WorkflowStateDetail'
import statesConst from '../states/statesConst'
import draggable from 'vuedraggable'
export default {
  name: 'WorkflowDetail',
  components: {
    WorkflowDelete,
    WorkflowStateDetail,
    draggable
  },
  data () {
    return {
      id: 0,
      workflow: null,
      workflowStateMap: {},
      statesTransition: {}
    }
  },
  computed: {
    inBacklogStates () {
      return _.filter(this.workflow.stateMachine.states, s => s.category === 1)
    },
    inProgressStates () {
      return _.filter(this.workflow.stateMachine.states, s => s.category === 2)
    },
    doneStates () {
      return _.filter(this.workflow.stateMachine.states, s => s.category === 3)
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
        const workflowStates = {}
        _.forEach(vue.workflow.stateMachine.states, state => {
          workflowStates[state.name] = state
        })
        vue.workflowStateMap = workflowStates
        vue.statesTransition = _.groupBy(vue.workflow.stateMachine.transitions, transition => transition.from)

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
    },
    buildToStates (state) {
      const matrix = {}
      _.forEach(this.workflow.stateMachine.states, s => {
        if (s.name !== state.name) {
          matrix[s.name] = { name: s.name, category: s.category, order: s.order, enabled: false }
        }
      })
      _.forEach(this.workflow.stateMachine.transitions, t => {
        if (t.from === state.name) {
          matrix[t.to].enabled = true
        }
      })
      return matrix
    },
    onCreateWorkflowStateDialog () {
    }
  }
}
</script>

<style scoped>
  .el-divider {
    margin: 10px 0 !important;
  }
  .state-category-stack-1 {
    background-color: #e4f5f8;
  }
  .state-category-stack-2 {
    background-color: #faf7dc;
  }
  .state-category-stack-3 {
    background-color: #f1f1f1;
  }
</style>
