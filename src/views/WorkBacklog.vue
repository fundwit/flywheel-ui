<template>
  <div class="page">
    <el-card class="box-card">
      {{total}}
      <div >
        <el-form :inline="true" :model="creationForm" class="demo-form-inline">
          <el-form-item label="Name">
            <el-input v-model="creationForm.name" placeholder="Work Name"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onCreateWork" icon="el-icon-circle-plus-outline">添加工作</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card style="background-color: #f8ef9d" class="box-card">
      <WorkList :works="processingWorks" @workUpdated="workUpdated" @workDeleted="workDeleted" />
    </el-card>

    <el-card style="background-color: #b6ebf5" class="box-card">
      <WorkList :works="pendingWorks" @workUpdated="workUpdated" @workDeleted="workDeleted" />
    </el-card>

    <el-card style="background-color: #aae8b2" class="box-card">
      <WorkList :works="finishedWorks" @workUpdated="workUpdated" @workDeleted="workDeleted"/>
    </el-card>
  </div>
</template>

<script>
import WorkList from '@/components/WorkList.vue'
import client from '../flywheel'
import _ from 'lodash'

export default {
  name: 'WorkBacklog',
  components: {
    WorkList
  },
  data () {
    return {
      creationForm: {
        name: ''
      },

      pendingWorks: [],
      processingWorks: [],
      finishedWorks: [],
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
      let arrayName = 'pendingWorks'
      if (work.stateName === 'DONE') {
        arrayName = 'finishedWorks'
      } else if (work.stateName === 'DOING') {
        arrayName = 'processingWorks'
      }

      delete work.state
      delete work.type
      const index = _.findIndex(this[arrayName], i => i.id === work.id)
      this[arrayName].splice(index, 1, work)
    },
    workDeleted (work) {
      let arrayName = 'pendingWorks'
      if (work.stateName === 'DONE') {
        arrayName = 'finishedWorks'
      } else if (work.stateName === 'DOING') {
        arrayName = 'processingWorks'
      }

      const index = _.findIndex(this[arrayName], i => i.id === work.id)
      this[arrayName].splice(index, 1)
    },
    onCreateWork () {
      const groupId = this.$route.query.projectId
      if (!groupId) {
        this.$notify.error({ title: 'Error', message: 'Group is not specified' })
        return
      }

      const mask = this.$loading({ lock: true, text: 'Creating', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createWork({ name: this.creationForm.name, groupId: groupId }).then((work) => {
        delete work.state
        delete work.type
        this.pendingWorks.push(work)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '创建失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    clear () {
      this.pendingWorks = []
      this.processingWorks = []
      this.finishedWorks = []
      this.total = 0
    },
    loadWorks () {
      this.clear()
      const groupId = this.$route.query.projectId
      if (!groupId) {
        return
      }
      const vue = this

      // mask
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryWork(groupId).then((resp) => {
        // vue.$set('works', response.data.data)
        vue.total = resp.total
        vue.pendingWorks = _.filter(resp.data, i => i.stateName === 'PENDING')
        vue.finishedWorks = _.filter(resp.data, i => i.stateName === 'DONE')
        vue.processingWorks = _.filter(resp.data, i => i.stateName === 'DOING')
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
