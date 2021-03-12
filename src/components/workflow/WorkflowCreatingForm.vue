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
    <div>states</div>

    <el-table :data="states" style="width: 100%">
      <el-table-column label="Name" prop="name">
        <template slot-scope="scope">
          <el-input size="small" placeholder="input the name of this state" v-model="scope.row.name"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="Category" prop="category">
        <template slot-scope="scope">
          <el-select v-model="scope.row.category" placeholder="select the category of this state">
            <el-option v-for="category in stateCategories"
                       :key="category.id" :label="category.name" :value="category.id">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column align="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleMoveStateUp(scope.$index, scope.row)">Move Up</el-button>
          <el-button size="mini" @click="handleMoveStateDown(scope.$index, scope.row)">Move Down</el-button>
          <el-button size="mini" type="danger" @click="handleDropState(scope.$index, scope.row)">Drop</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button size="mini" type="success" @click="handleAddState()">Add State</el-button>

    <div>states transitions</div>
    <table>
      <tr>
        <th></th>
        <th v-for="to in states" :key="to.name">To {{to.name}}</th>
      </tr>
      <tr v-for="from in states" :key="from.name">
        <th>From {{from.name}}</th>
        <td v-for="to in states" :key="to.name">
          <span v-if="from.name === to.name"> - </span>
          <span v-if="from.name !== to.name"> V </span>
        </td>
      </tr>
    </table>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onCreateWorkflow">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client, stateCategories } from '../../flywheel'
import { randomColor } from '../../colors'

export default {
  name: 'WorkflowCreatingForm',
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
      states: [],
      transitions: [],
      creatingResult: null
    }
  },
  methods: {
    handleAddState () {
      this.states.push({ name: '', category: null })
    },
    handleMoveStateUp (idx) {
      if (idx <= 0) {
        return
      }
      const stateArray = this.states
      const item = stateArray[idx]
      this.$set(this.states, idx, this.states[idx - 1])
      this.$set(this.states, idx - 1, item)
    },
    handleMoveStateDown (idx) {
      if (idx >= this.states.length - 1) {
        return
      }
      const stateArray = this.states
      const item = stateArray[idx]
      this.$set(this.states, idx, this.states[idx + 1])
      this.$set(this.states, idx + 1, item)
    },
    handleDropState (idx) {
      this.states.splice(idx, 1)
    },
    onCancel () {
      this.$emit('creating-result', null)
    },
    buildFullTransitions (states) {
      const fullTransitions = []
      states.forEach(fromState => {
        states.forEach(toState => {
          if (fromState.name !== toState.name) {
            fullTransitions.push({ name: fromState.name + '->' + toState.name, from: fromState.name, to: toState.name })
          }
        })
      })
      return fullTransitions
    },
    onCreateWorkflow () {
      if (!this.creatingWorkflow || !this.creatingWorkflow.name || !this.creatingWorkflow.groupId || !this.states || !this.states.length) {
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
        stateMachine: {
          states: this.states,
          transitions: this.buildFullTransitions(this.states)
        }
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
