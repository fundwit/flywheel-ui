<template>
  <div>
    <div>Project Manage</div>
    <el-button type="primary" size="mini" @click="onCreateProjectDialog" icon="el-icon-circle-plus-outline">Create Project</el-button>
    <el-table :data="projects" style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="200">
      </el-table-column>
      <el-table-column
        prop="name"
        label="Name">
      </el-table-column>
      <el-table-column
        prop="identifier"
        label="Identifier">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="Create Time">
      </el-table-column>
    </el-table>

    <el-dialog v-if="showProjectCreatingDialog === true" title="Create User" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <project-creation @action-result="onProjectCreationResult"/>
    </el-dialog>
  </div>
</template>

<script>
import client from '../../flywheel'
import ProjectCreation from '../components/ProjectCreation'

export default {
  name: 'ProjectManage',
  components: {
    ProjectCreation
  },
  data () {
    return {
      projects: [],
      showProjectCreatingDialog: false
    }
  },
  mounted () {
    this.loadProjects()
  },
  methods: {
    loadProjects () {
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryProjects().then(resp => {
        vue.projects = resp.data
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onCreateProjectDialog () {
      this.showProjectCreatingDialog = true
    },
    onProjectCreationResult (result) {
      this.showProjectCreatingDialog = false
      if (result) {
        this.loadProjects()
      }
    }
  }
}
</script>

<style scoped>
</style>
