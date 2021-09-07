<template>
  <div>
    <el-button v-if="!showCreatingDialog" type="primary" size="mini" @click="onCreatingStateDialog" icon="el-icon-circle-plus-outline">添加状态</el-button>

    <el-card v-if="showCreatingDialog">
      <el-form ref="form" v-model="creatingState" label-width="80px">
        <el-form-item label="Name">
          <el-input v-model="creatingState.name"></el-input>
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="creatingState.category">
            <el-option v-for="item in stateCategories"
                       :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="false" label="Transition To">
          <state-multi-selector :states="otherStates" :exclude-state-names="[]" :initial-selected-state-names="initialSelectedStateNames"
                                @stateSelectChanged="toggleTransition"/>
        </el-form-item>
        <el-button type="primary" @click="onCreateState">Create</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { stateCategories } from '../../flywheel'
import _ from 'lodash'
import StateMultiSelector from './StateMultiSelector'

export default {
  name: 'StateCreatingForm',
  components: {
    StateMultiSelector
  },
  props: {
    otherStates: null
  },
  data () {
    return {
      showCreatingDialog: false,
      creatingState: {
        name: '',
        transitions: []
      },
      stateCategories: stateCategories
    }
  },
  computed: {
    initialSelectedStateNames () {
      return _.map(this.otherStates, s => s.name)
    }
  },
  methods: {
    onCreatingStateDialog () {
      this.showCreatingDialog = true
    },
    clear () {
      this.showCreatingDialog = false
      this.creatingState = {
        name: '',
        transitions: []
      }
    },
    onCreateState () {
      if (this.creatingState.name.trim().length === 0) {
        this.$notify.warning({ title: 'Warning', message: 'state name must not be empty' })
        return
      }

      if (!this.creatingState.category) {
        this.$notify.warning({ title: 'Warning', message: 'state category must not be empty' })
        return
      }

      if (_.find(this.otherStates, s => s.name === this.creatingState.name.trim())) {
        this.$notify.warning({ title: 'Warning', message: 'state name duplicated' })
        return
      }

      const transitions = []
      _.forEach(this.otherStates, s => {
        transitions.push({ name: this.creatingState.name + '->' + s.name, from: this.creatingState.name, to: s.name })
        transitions.push({ name: s.name + '->' + this.creatingState.name, from: s.name, to: this.creatingState.name })
      })
      this.creatingState.transitions = transitions
      this.$emit('stateCreated', this.creatingState)
      this.clear()
    },
    onCancel () {
      this.clear()
    },
    toggleTransition () {
    }
  }
}
</script>

<style scoped>

</style>
