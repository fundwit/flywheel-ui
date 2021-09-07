<template>
  <span>
    <el-tag v-for="state in selectionMap" :key="state.name" size="small" style="margin: 0 5px"
            class="state-item" :class="state.enabled ? 'state-to-enabled' : 'state-to-disabled'"
            :type="categoryStyle(state.category).style" :effect="state.enabled ? 'dark' : 'plain'"
            @click="onSelectChanged(state.name, !state.enabled)">
          <i :class="state.enabled ? 'el-icon-circle-check' : 'el-icon-circle-close'"/> {{ state.name }}
    </el-tag>
  </span>
</template>

<script>
import { categoryStyle } from '../../themes'
import _ from 'lodash'
export default {
  name: 'StateMultiSelector',
  props: {
    states: null,
    excludeStateNames: null,
    initialSelectedStateNames: null
  },
  data () {
    return {
      selectionMap: this.buildSelectionMap()
    }
  },
  watch: {
    initialSelectedStateNames (val) {
      this.selectionMap = this.buildSelectionMap()
    }
  },
  methods: {
    categoryStyle: categoryStyle,

    buildSelectionMap () {
      const map = {}
      _.forEach(this.states, state => {
        map[state.name] = { name: state.name, category: state.category, order: state.order, enabled: false }
      })

      if (this.excludeStateNames) {
        _.forEach(this.excludeStateNames, name => {
          delete map[name]
        })
      }

      if (this.initialSelectedStateNames) {
        _.forEach(this.initialSelectedStateNames, name => {
          if (map[name]) {
            map[name].enabled = true
          }
        })
      }

      return map
    },
    onSelectChanged (stateName, selected) {
      this.$emit('stateSelectChanged', stateName, selected)
    }
  }
}
</script>

<style scoped>
.state-item {
  cursor: pointer;
}
</style>
