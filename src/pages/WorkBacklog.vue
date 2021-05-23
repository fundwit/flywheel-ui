<template>
  <div class="page">
    <el-card class="box-card">
      <el-button type="primary" size="mini" @click="showCreatingDialog = true" icon="el-icon-circle-plus-outline">添加工作</el-button>
    </el-card>
    <el-dialog v-if="showCreatingDialog === true" title="Create Work" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <work-creating-form :selectedProjectId="$route.query.projectId" @action-result="onCreatingResult"/>
    </el-dialog>

    <el-card class="box-card">
      <WorkList :works="works" :workflowIndex="workflowIndex" @workUpdated="workUpdated" @workDeleted="workDeleted" />
    </el-card>
  </div>
</template>

<script>
import WorkList from '../components/WorkList.vue'
import WorkCreatingForm from '../components/work/WorkCreatingForm'
import client from '../flywheel'
import _ from 'lodash'

export default {
  name: 'WorkBacklog',
  components: {
    WorkList,
    WorkCreatingForm
  },
  data () {
    return {
      works: [],
      workflowIndex: {},
      total: 0,

      showCreatingDialog: false
    }
  },
  watch: {
    $route: {
      handler () {
        this.loadWorks()
      },
      deep: true
    }
  },
  mounted () {
    this.loadWorks()
  },
  methods: {
    workUpdated (work) {
      delete work.state
      delete work.type
      const index = _.findIndex(this.works, i => i.id === work.id)
      this.works.splice(index, 1, work)
    },
    workDeleted (work) {
      const index = _.findIndex(this.works, i => i.id === work.id)
      this.works.splice(index, 1)
    },
    onCreatingResult (work) {
      this.showCreatingDialog = false
      if (work) {
        delete work.state
        delete work.type
        this.works.push(work)
      }
    },
    clear () {
      this.works = []
      this.workflowIndex = {}
      this.total = 0
    },
    loadWorks () {
      this.clear()
      const projectId = this.$route.query.projectId
      if (!projectId) {
        return
      }
      const vue = this

      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryWorkflows(projectId).then(resp => {
        _.forEach(resp, workflow => {
          vue.workflowIndex[workflow.id] = workflow
        })
        return client.queryBacklog(projectId)
      }).then((resp) => {
        vue.total = resp.total
        vue.works = resp.data // vue.$set('works', response.data.data)
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
  .page {
    margin: 1em auto;
    width: 80%;
  }
  .box-card {
    margin: 0 0 1em 0;
  }
</style>
