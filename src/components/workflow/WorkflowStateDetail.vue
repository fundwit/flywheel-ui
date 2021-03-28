<template>
  <div>
    <div id="work-detail-header" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: stretch">
      <div style="flex-grow: 1; padding: 10px; font-size: 1.0rem">
        <el-tag v-if="!isNameEditing" :type="categoryStyle(state.category).style" size="small" effect="dark">
          {{ state.name }}
        </el-tag>
        <el-input v-if="isNameEditing" v-model="editingName"></el-input>
      </div>
      <div style="padding: 10px; font-size: 1.0rem">
        <el-button v-if="!isNameEditing" @click="onEditNameStarted" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-edit-outline" type="primary" size="small"/>

        <span v-if="isNameEditing">
          <el-button @click="onEditNameSubmitted" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-check" type="success" size="mini"></el-button>
          <el-button @click="onEditNameCanceled" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-close" type="warning" size="mini"></el-button>
        </span>
      </div>
    </div>

    <el-divider/>
    <div style="margin-left: 50px">
      <span>可转移到的目标状态: </span>
      <el-tag v-for="(toState, nameOfToState) in toStatesMatrix" :key="nameOfToState" size="small" style="margin: 0 5px"
              class="state-to" :class="toState.enabled ? 'state-to-enabled' : 'state-to-disabled'"
              :type="categoryStyle(toState.category).style" :effect="toState.enabled ? 'dark' : 'plain'"
              @click="toggleTransition(state.name, toState.name, !toState.enabled)">
        <i :class="toState.enabled ? 'el-icon-circle-check' : 'el-icon-circle-close'"/> {{ toState.name }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import { categoryStyle } from '../../themes'
import client from '../../flywheel'
import _ from 'lodash'

export default {
  name: 'WorkflowStateDetail',
  props: {
    workflowId: null,
    state: null,
    toStates: null
  },
  data () {
    return {
      editingName: '',
      isNameEditing: false,
      toStatesMatrix: this.toStates
    }
  },
  methods: {
    categoryStyle: categoryStyle,
    toggleTransition (fromName, toName, enabled) {
      const vue = this

      this.$confirm(`确定 ${enabled ? '开启' : '关闭'} 从状态 '${fromName}' 到状态 '${toName}' 的转移?`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '放弃操作',
        type: 'warning'
      }).then(() => {
        const mask = this.$loading({ lock: true, text: 'Processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
        const requestPromise = enabled ? client.enableWorkflowTransition(this.workflowId, fromName, toName)
          : client.disableWorkflowTransition(this.workflowId, fromName, toName)
        requestPromise.then(() => {
          const toState = vue.toStatesMatrix[toName]
          toState.enabled = enabled
          vue.$set(vue.toStatesMatrix, toName, toState)
          vue.$emit('workflowUpdated', vue.workflowId)
        }).catch((error) => {
          this.$notify.error({ title: 'Error', message: 'process failed: ' + error })
        }).finally(() => {
          mask.close()
        })
      })
    },
    onEditNameStarted () {
      this.editingName = this.state.name
      this.isNameEditing = true
    },
    onEditNameSubmitted () {
      if (this.editingName === this.state.name) {
        this.$notify.warning({ title: 'Warning', message: 'no changes' })
        this.abortEditing()
        return
      }

      if (this.editingName.trim().length === 0) {
        this.$notify.warning({ title: 'Warning', message: 'work name must not be empty' })
        return
      }

      const vue = this
      const changes = { originName: this.state.name, name: this.editingName, order: this.state.order }
      client.updateWorkflowState(this.workflowId, changes).then(() => {
        vue.state = _.assignIn(vue.state, { name: this.editingName })
        vue.abortEditing()
        vue.$emit('workflowStateUpdated', changes)
      }).catch(error => {
        vue.$notify.error({ title: 'Error', message: '更新失败' + error })
      })
    },
    onEditNameCanceled () {
      this.abortEditing()
    },
    abortEditing () {
      this.editingName = ''
      this.isNameEditing = false
    }
  }
}
</script>

<style scoped>
.el-divider {
  margin: 5px 0 !important;
}
.state-to {
  cursor: pointer;
}
.state-to-enabled {
}
.state-to-disabled {
}
</style>
