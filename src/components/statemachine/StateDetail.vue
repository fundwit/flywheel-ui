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
      <span>可转移到: </span>
        <state-multi-selector :states="states" :exclude-state-names="[state.name]" :initial-selected-state-names="initialSelectedStateNames"
                              @stateSelectChanged="toggleTransition"/>
    </div>
  </div>
</template>

<script>
import { categoryStyle } from '../../themes'
import _ from 'lodash'
import StateMultiSelector from './StateMultiSelector'

export default {
  name: 'StateDetail',
  components: {
    StateMultiSelector
  },
  props: {
    id: null,
    state: null,
    states: null,
    initialSelectedStateNames: null
  },
  data () {
    return {
      editingName: '',
      isNameEditing: false
    }
  },
  methods: {
    categoryStyle: categoryStyle,
    toggleTransition (toName, enabled) {
      this.$emit('stateTransitionChanged', this.state.name, toName, enabled)
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
        this.$notify.warning({ title: 'Warning', message: 'state name must not be empty' })
        return
      }

      if (_.find(this.states, s => s.name === this.editingName.trim())) {
        this.$notify.warning({ title: 'Warning', message: 'state name duplicated' })
        return
      }

      const vue = this
      const changes = { originName: this.state.name, name: this.editingName, order: this.state.order }
      vue.$emit('stateUpdated', changes)
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
</style>
