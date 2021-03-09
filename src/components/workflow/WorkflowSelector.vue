<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-if="loadingError" style="color: red">{{ loadingError }}</div>
    <div v-if="workflows">
      <el-select v-model="selectedId" @change="onWorkflowSelected">
        <el-option v-for="item in workflows" :value="item.id" :label="item.name" :key="item.id">
          <span style="float: left">
            <el-tag size="small" :style="{ backgroundColor: item.themeColor }" effect="dark">
              <i :class="item.themeIcon ? item.themeIcon : 'el-icon-s-claim'"/>
            </el-tag>
          </span>
          <span style="float: left; margin-left: 10px"> {{item.name}}</span>
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import _ from 'lodash'
export default {
  name: 'WorkflowSelector',
  props: {
    groupId: null
  },
  data () {
    return {
      selectedId: null,
      workflows: null,
      isLoading: false,
      loadingError: null
    }
  },
  mounted () {
    this.loadWorkflows(this.groupId)
  },
  watch: {
    groupId (val) {
      this.loadWorkflows(val)
    }
  },
  methods: {
    onWorkflowSelected (val) {
      this.$emit('workflowSelected', _.find(this.workflows, w => w.id === val))
    },
    loadWorkflows (groupId) {
      if (!groupId) {
        this.loadingError = 'group id is empty'
        return
      }
      this.isLoading = true
      client.queryWorkflows(this.groupId).then(resp => {
        this.workflows = resp
      }).catch(err => {
        this.loadingError = err
      }).finally(() => {
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>
</style>
