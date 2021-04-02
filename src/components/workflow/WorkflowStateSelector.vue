<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-if="loadingError" style="color: red">{{ loadingError }}</div>
    <div v-if="workflowDetail">
      <el-tag v-for="(state, idx) in filteredStates" :key="state.name" :type="categoryStyle(state.category).style"
              size="small" :effect="(selectedState && selectedState.name === state.name) ? 'dark' : 'light'"
              class="state-list-item"
              @click="selectState(idx)">
        {{ state.name }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { client, stateCategories } from '../../flywheel'
import { categoryStyle } from '../../themes'
export default {
  name: 'WorkflowStateSelector',
  props: {
    workflowId: null,
    categoryFilters: null
  },
  data () {
    return {
      selectedState: null,
      stateCategories: stateCategories,
      workflowDetail: null,
      filteredStates: null,
      isLoading: false,
      loadingError: null
    }
  },
  watch: {
    workflowId () {
      this.loadData()
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    categoryStyle: categoryStyle,
    loadData () {
      if (!this.workflowId) {
        this.loadingError = 'workflow id is empty'
        return
      }
      this.isLoading = true
      client.detailWorkflow(this.workflowId).then(resp => {
        this.workflowDetail = resp
        this.filteredStates = _.filter(resp.stateMachine.states, s => !this.categoryFilters || _.find(this.categoryFilters, f => f === s.category))
        this.selectState(0)
      }).catch(err => {
        this.loadingError = err
      }).finally(() => {
        this.isLoading = false
      })
    },
    selectState (idx) {
      this.selectedState = this.filteredStates[idx]
      this.$emit('workflowStateSelected', this.selectedState)
    }
  }
}
</script>

<style scoped>
.state-list-item {
  margin-right: 1px;
  cursor: pointer;
}
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
