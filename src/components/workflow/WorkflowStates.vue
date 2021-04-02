<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-if="loadingError" style="color: red">{{ loadingError }}</div>
    <div v-if="workflowDetail">
      <el-tag v-for="state in workflowDetail.stateMachine.states" :key="state.name" :type="categoryStyle(state.category).style"
              size="small" effect="dark" class="state-list-item">
        {{ state.name }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import { client, stateCategories } from '../../flywheel'
import { categoryStyle } from '../../themes'
export default {
  name: 'WorkflowStates',
  props: {
    workflowId: null
  },
  data () {
    return {
      stateCategories: stateCategories,
      workflowDetail: null,
      isLoading: false,
      loadingError: null
    }
  },
  mounted () {
    if (!this.workflowId) {
      this.loadingError = 'workflow id is empty'
      return
    }
    this.isLoading = true
    client.detailWorkflow(this.workflowId).then(resp => {
      this.workflowDetail = resp
    }).catch(err => {
      this.loadingError = err
    }).finally(() => {
      this.isLoading = false
    })
  },
  methods: {
    categoryStyle: categoryStyle
  }
}
</script>

<style scoped>
.state-list-item {
  margin-right: 1px;
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
