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
        <draggable group="backlog" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                   @end="onStateOrderChangeEnd">
          <el-card v-for="state in categoryStates[1]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-1" style="margin: 20px 0; border-radius: 0;">
            <workflow-state-detail :workflow-id="workflow.id" :state="state" :to-states="buildToStates(state)"/>
          </el-card>
        </draggable>

        <el-divider/>
        <draggable group="inProgress" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                   @end="onStateOrderChangeEnd">
          <el-card v-for="state in categoryStates[2]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-2" style="margin: 20px 0; border-radius: 0">
            <workflow-state-detail :workflow-id="workflow.id" :state="state" :to-states="buildToStates(state)"/>
          </el-card>
        </draggable>

        <el-divider/>
        <draggable group="done" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                   @end="onStateOrderChangeEnd">
          <el-card v-for="state in categoryStates[3]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-3" style="margin: 20px 0; border-radius: 0">
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
import computeOrderChanges from '../orders'
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
      statesTransition: {},
      categoryStates: {}
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

        vue.categoryStates = _.groupBy(vue.workflow.stateMachine.states, s => s.category)
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
    },
    onStateOrderChangeEnd (event) {
      // const state = event.item.getAttribute('data-state')
      const category = event.item.getAttribute('data-category')
      this.updateOrders(category, event.newIndex, event.oldIndex)
    },
    updateOrders (category, newIndex, oldIndex) {
      const vue = this
      const states = vue.categoryStates[category]
      if (!states || states.length <= 1) {
        return Promise.resolve()
      }

      const draggedState = states[oldIndex]
      states.splice(oldIndex, 1)
      states.splice(newIndex, 0, draggedState)

      // compute orders
      const stateOrders = _.map(states, (state, index) => {
        return { index: index, state: state.name, order: state.order }
      })
      const changes = computeOrderChanges(stateOrders, 'state', 'order', newIndex, oldIndex)
      if (!changes || changes.length === 0) {
        return Promise.resolve()
      }
      return client.updateWorkflowStateRangeOrders(this.workflow.id, changes).then(() => {
        _.forEach(changes, change => {
          states[change.index].order = change.newOrder
        })
        vue.$set(vue.categoryStates, category, states)
      }).catch(error => {
        vue.categoryStates[category].splice(newIndex, 1)
        vue.categoryStates[category].splice(oldIndex, 0, draggedState)
        vue.$set(vue.categoryStates, category, vue.categoryStates[category])
        this.$notify.error({ title: 'Error', message: 'failed to update index:' + error })
      })
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
