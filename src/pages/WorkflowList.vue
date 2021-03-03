<template>
  <el-card class="box-card" style="width: 80%; margin: 1rem auto">
    <el-button type="primary" @click="onCreateWorkflowDialog" icon="el-icon-circle-plus-outline">添加工作流</el-button>
    <el-table :data="workflows" style="width: 100%">
      <el-table-column width="50">
        <template slot-scope="scope">
          <el-tag size="small" :style="{ backgroundColor: scope.row.themeColor }" effect="dark">
            <i :class="scope.row.themeIcon ? scope.row.themeIcon : 'el-icon-s-claim'"/>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Name" width="300">
        <template slot-scope="scope">
          <router-link :to="{ name: 'WorkflowDetail', params: { id: scope.row.id }}">{{scope.row.name}}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="States">
        <template slot-scope="scope">
          <WorkflowStates :workflow-id="scope.row.id"/>
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template slot-scope="scope">
          <el-button @click="onEditWorkflow(scope)" type="text" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-if="showCreatingDialog === true" title="Create Workflow" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <workflow-creating-form :selectedProjectId="$route.query.projectId" @creating-result="onCreatingResult"/>
    </el-dialog>
  </el-card>
</template>

<script>
import client from '../flywheel'
import WorkflowCreatingForm from '../components/workflow/WorkflowCreatingForm'
import WorkflowStates from '../components/workflow/WorkflowStates'

export default {
  name: 'WorkflowList',
  components: {
    WorkflowCreatingForm,
    WorkflowStates
  },

  data () {
    return {
      total: 0,
      workflows: [],
      showCreatingDialog: false
    }
  },
  mounted () {
    this.loadWorkflows()
  },
  watch: {
    $route: {
      handler () {
        this.loadWorkflows()
      },
      deep: true
    }
  },
  methods: {
    onCreateWorkflowDialog () {
      this.showCreatingDialog = true
    },
    onEditWorkflow (scope) {
      console.log(scope.row.name)
    },
    onCreatingResult (result) {
      this.showCreatingDialog = false
      if (result) {
        this.loadWorkflows()
      }
    },
    selectedProjectId () {
      return this.$route.query.projectId
    },
    loadWorkflows () {
      const groupId = this.selectedProjectId()
      if (!groupId) {
        return
      }
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryWorkflows(groupId).then((resp) => {
        vue.total = resp.length
        vue.workflows = resp
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    }
  }
}
</script>

<style scoped>
</style>
