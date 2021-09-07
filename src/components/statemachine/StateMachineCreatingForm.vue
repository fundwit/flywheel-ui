<template>
  <div>
    <div style="margin: 10px 40px">
      <state-creating-form :other-states="stateMachine.states"  @stateCreated="handleStateCreating"/>

      <draggable group="backlog" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                 @end="onStateOrderChangeEnd">
        <el-card v-for="state in categoryStates[1]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-1" style="margin: 20px 0; border-radius: 0;">
          <el-button type="danger" size="mini" @click="handleStateDeleting(state.name)" :data-state="state.name">delete</el-button>
          <state-detail :state="state" :states="stateMachine.states"
                        :initial-selected-state-names="buildInitialToStateNames(state)"
                        @stateUpdated="onStateUpdated" @stateTransitionChanged="onStateTransitionChanged"/>
        </el-card>
      </draggable>

      <el-divider/>
      <draggable group="inProgress" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                 @end="onStateOrderChangeEnd">
        <el-card v-for="state in categoryStates[2]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-2" style="margin: 20px 0; border-radius: 0">
          <el-button type="danger" size="mini" @click="handleStateDeleting(state.name)" :data-state="state.name">delete</el-button>
          <state-detail :state="state" :states="stateMachine.states"
                        :initial-selected-state-names="buildInitialToStateNames(state)"
                        @stateUpdated="onStateUpdated" @stateTransitionChanged="onStateTransitionChanged"/>
        </el-card>
      </draggable>

      <el-divider/>
      <draggable group="done" animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                 @end="onStateOrderChangeEnd">
        <el-card v-for="state in categoryStates[3]" :data-state="state.name" :data-category=state.category :key="state.name" class="item state-category-stack-3" style="margin: 20px 0; border-radius: 0">
          <el-button type="danger" size="mini" @click="handleStateDeleting(state.name)" :data-state="state.name">delete</el-button>
          <state-detail :state="state" :states="stateMachine.states"
                        :initial-selected-state-names="buildInitialToStateNames(state)"
                        @stateUpdated="onStateUpdated" @stateTransitionChanged="onStateTransitionChanged"/>
        </el-card>
      </draggable>
    </div>
  </div>
</template>

<script>
import StateDetail from './StateDetail'
import StateCreatingForm from './StateCreatingForm'
import draggable from 'vuedraggable'
import _ from 'lodash'

export default {
  name: 'StateMachineCreatingForm',
  components: {
    StateDetail,
    StateCreatingForm,
    draggable
  },
  props: {
    id: null
  },
  data () {
    return {
      stateMachine: {
        states: [],
        transitions: []
      },
      categoryStates: {}
    }
  },
  methods: {
    stateMachineUpdated (fsm) {
      fsm.states = _.sortBy(fsm.states, s => s.category)
      this.stateMachine = fsm
      this.categoryStates = _.groupBy(this.stateMachine.states, s => s.category)
      this.$emit('stateMachineUpdated', fsm)
    },
    handleStateCreating (creatingState) {
      const fsm = this.stateMachine
      fsm.states.push({ name: creatingState.name, category: creatingState.category })
      _.forEach(creatingState.transitions, t => {
        fsm.transitions.push(t)
      })
      this.stateMachineUpdated(fsm)
    },
    handleStateDeleting (stateName) {
      const fsm = this.stateMachine
      _.remove(fsm.states, s => s.name === stateName)
      _.remove(fsm.transitions, t => t.from === stateName || t.to === stateName)
      this.stateMachineUpdated(fsm)
    },
    onStateUpdated (change) {
      // { originName: ..., name: ..., order: ... }
      const fsm = this.stateMachine
      _.forEach(fsm.states, s => {
        if (s.name === change.originName) {
          s.name = change.name
        }
      })
      _.forEach(fsm.transitions, t => {
        if (t.from === change.originName) {
          t.from = change.name
          t.name = t.from + '->' + t.to
        }
        if (t.to === change.originName) {
          t.to = change.name
          t.name = t.from + '->' + t.to
        }
      })
      this.stateMachineUpdated(fsm)
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
    onStateTransitionChanged (fromName, toName, enabled) {
      const fsm = this.stateMachine
      if (enabled && !_.find(fsm.transitions, t => t.from === fromName && t.to === toName)) {
        fsm.transitions.push({ name: fromName + '->' + toName, from: fromName, to: toName })
      } else {
        _.remove(fsm.transitions, t => t.from === fromName && t.to === toName)
      }
      this.stateMachineUpdated(fsm)
    },
    onStateOrderChangeEnd (event) {
      const category = event.item.getAttribute('data-category')
      const fsm = this.stateMachine
      fsm.states = _.sortBy(fsm.states, s => s.category)
      const beginIndex = _.findIndex(fsm.states, s => s.category + '' === category)
      const state = fsm.states[event.oldIndex + beginIndex]
      fsm.states.splice(event.oldIndex + beginIndex, 1)
      fsm.states.splice(event.newIndex + beginIndex, 0, state)
      this.stateMachineUpdated(fsm)
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
