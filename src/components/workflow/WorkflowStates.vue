<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-if="loadingError" style="color: red">{{ loadingError }}</div>
    <div v-if="workflowDetail">
      <el-tag v-for="state in workflowDetail.stateMachine.states" :key="state.name" :type="mapStateCategory(state.category).style" size="small" effect="dark">
        {{ state.name }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import { client, stateCategories } from '../../flywheel'
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
    mapStateCategory (category) {
      if (category === 0) {
        return {
          style: ''
        }
      } else if (category === 1) {
        return {
          style: 'warning'
        }
      } else if (category === 2) {
        return {
          style: 'info'
        }
      }
    }
  }
}
</script>

<style scoped>
.state-category-stack-0 {
  background-color: #daf3f8;
}
.state-category-stack-1 {
  background-color: #fcf7cd;
}
.state-category-stack-2 {
  background-color: #e2e2e2;
}
</style>
