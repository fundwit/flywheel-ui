<template>
  <div class="page">
    <el-card class="box-card">
      {{total}}
      <div >
        <el-form :inline="true" :model="creationForm" class="demo-form-inline">
          <el-form-item label="Name">
            <el-input v-model="creationForm.name" placeholder="Work Name"></el-input>
          </el-form-item>
          <el-form-item label="Workflow">
            <workflow-selector :group-id="this.$route.query.projectId" @workflowSelected="onWorkflowSelected"/>
          </el-form-item>
          <el-form-item>
            [{{creationForm.workflow.name}}]
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onCreateWork" icon="el-icon-circle-plus-outline">添加工作</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="box-card">
      <WorkList :works="works" @workUpdated="workUpdated" @workDeleted="workDeleted" />
    </el-card>
  </div>
</template>

<script>
import WorkList from '@/components/WorkList.vue'
import WorkflowSelector from '../components/workflow/WorkflowSelector'
import client from '../flywheel'
import _ from 'lodash'

export default {
  name: 'WorkBacklog',
  components: {
    WorkList,
    WorkflowSelector
  },
  data () {
    return {
      creationForm: {
        name: '',
        workflow: {}
      },
      works: [],
      total: 0
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
    onCreateWork () {
      const groupId = this.$route.query.projectId
      if (!groupId) {
        this.$notify.error({ title: 'Error', message: 'Group is not specified' })
        return
      }

      const mask = this.$loading({ lock: true, text: 'Creating', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createWork({ name: this.creationForm.name, groupId: groupId, flowId: this.creationForm.workflow.id }).then((work) => {
        delete work.state
        delete work.type
        this.works.push(work)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '创建失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    clear () {
      this.works = []
      this.total = 0
    },
    loadWorks () {
      this.clear()
      const groupId = this.$route.query.projectId
      if (!groupId) {
        return
      }
      const vue = this

      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryBacklog(groupId).then((resp) => {
        vue.total = resp.total
        vue.works = resp.data // vue.$set('works', response.data.data)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onWorkflowSelected (val) {
      this.creationForm.workflow = val
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
