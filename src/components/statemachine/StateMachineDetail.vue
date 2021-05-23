<template>
  <div>
    <div v-if="stateMachine" style="margin: 10px 40px">
      <state-creating-form :other-states="stateMachine.states"  @stateCreated="handleStateCreating"/>

      <draggable group="in-backlog" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                 @end="onStateOrderChangeEnd">
        <el-card v-for="state in categoryStates[1]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-1" style="margin: 20px 0; border-radius: 0;">
          <state-detail :id="id" :state="state" :states="stateMachine.states"
                        :initial-selected-state-names="buildInitialToStateNames(state)"
                        @stateUpdated="onStateUpdated" @stateTransitionChanged="onStateTransitionChanged"/>
        </el-card>
      </draggable>

      <el-divider/>
      <draggable group="in-progress" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                 @end="onStateOrderChangeEnd">
        <el-card v-for="state in categoryStates[2]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-2" style="margin: 20px 0; border-radius: 0">
          <state-detail :id="id" :state="state" :states="stateMachine.states"
                        :initial-selected-state-names="buildInitialToStateNames(state)"
                        @stateUpdated="onStateUpdated" @stateTransitionChanged="onStateTransitionChanged"/>
        </el-card>
      </draggable>

      <el-divider/>
      <draggable group="done" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                 @end="onStateOrderChangeEnd">
        <el-card v-for="state in categoryStates[3]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-3" style="margin: 20px 0; border-radius: 0">
          <state-detail :id="id" :state="state" :states="stateMachine.states"
                        :initial-selected-state-names="buildInitialToStateNames(state)"
                        @stateUpdated="onStateUpdated" @stateTransitionChanged="onStateTransitionChanged"/>
        </el-card>
      </draggable>

      <draggable group="done" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                 @end="onStateOrderChangeEnd">
        <el-card v-for="state in categoryStates[4]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-4" style="margin: 20px 0; border-radius: 0">
          <state-detail :id="id" :state="state" :states="stateMachine.states"
                        :initial-selected-state-names="buildInitialToStateNames(state)"
                        @stateUpdated="onStateUpdated" @stateTransitionChanged="onStateTransitionChanged"/>
        </el-card>
      </draggable>
    </div>
  </div>
</template>

<script>
import StateDetail from './StateDetail'
import draggable from 'vuedraggable'
import _ from 'lodash'
import client from '../../flywheel'
import computeOrderChanges from '../../orders'
import statesConst from '../../states/statesConst'
import StateCreatingForm from './StateCreatingForm'

export default {
  name: 'StateMachineDetail',
  components: {
    StateDetail,
    StateCreatingForm,
    draggable
  },
  props: {
    id: null,
    initialStateMachine: null
  },
  data () {
    return {
      stateMachine: this.initialStateMachine,
      categoryStates: _.groupBy(this.initialStateMachine.states, s => s.category)
    }
  },
  watch: {
    stateMachine (val) {
      this.categoryStates = _.groupBy(val.states, s => s.category)
    }
  },
  methods: {
    onStateUpdated (changes) {
      // { originName, name, order }
      const vue = this
      client.updateWorkflowState(this.id, changes).then(() => {
        this.loadWorkflowDetail()
      }).catch(error => {
        vue.$notify.error({ title: 'Error', message: '更新失败' + error })
      })
    },
    handleStateCreating (creatingState) {
      // { name, category, transitions }
      creatingState.order = 20001 + this.stateMachine.states.length
      const vue = this
      client.createWorkflowState(this.id, creatingState).then(() => {
        this.loadWorkflowDetail()
      }).catch(error => {
        vue.$notify.error({ title: 'Error', message: '更新失败' + error })
      })
    },
    buildInitialToStateNames (state) {
      const names = []
      _.forEach(this.stateMachine.transitions, t => {
        if (t.from === state.name) {
          names.push(t.to)
        }
      })
      return names
    },
    loadWorkflowDetail () {
      if (!this.id) {
        return
      }
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.detailWorkflow(this.id).then((resp) => {
        vue.stateMachine = resp.stateMachine
        this.$store.commit(statesConst.currentProjectId, resp.projectId)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onStateTransitionChanged (fromName, toName, enabled) {
      const vue = this
      this.$confirm(`确定 ${enabled ? '开启' : '关闭'} 从状态 '${fromName}' 到状态 '${toName}' 的转移?`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '放弃操作',
        type: 'warning'
      }).then(() => {
        const mask = this.$loading({ lock: true, text: 'Processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
        const requestPromise = enabled ? client.enableWorkflowTransition(this.id, fromName, toName)
          : client.disableWorkflowTransition(this.id, fromName, toName)
        requestPromise.then(() => {
          vue.loadWorkflowDetail()
        }).catch((error) => {
          this.$notify.error({ title: 'Error', message: 'process failed: ' + error })
        }).finally(() => {
          mask.close()
        })
      })
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
      return client.updateWorkflowStateRangeOrders(this.id, changes).then(() => {
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
  background-color: #dbf8ce;
}
.state-category-stack-4 {
  background-color: #f1f1f1;
}
</style>
