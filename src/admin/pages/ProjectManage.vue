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
      <el-table-column prop="name" label="Name">
        <template slot-scope="scope">
          <span v-if="!scope.row.isEditing">
            {{scope.row.name}}
          </span>
          <el-input v-if="scope.row.isEditing" v-model="editingResource.name"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="identifier"
        label="Identifier">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="Create Time">
      </el-table-column>
      <el-table-column prop="action" label="操作" width="180px">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.isEditing" @click="onEditRow(scope)" type="text" size="small">编辑</el-button>
          <el-button v-if="scope.row.isEditing" @click="onSaveRow(scope)" type="text" size="small">保存</el-button>
          <el-button v-if="scope.row.isEditing" @click="onAbortEdit(scope)" type="text" size="small">取消</el-button>
        </template>
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
import _ from 'lodash'
import statesConst from '../../states/statesConst'

export default {
  name: 'ProjectManage',
  components: {
    ProjectCreation
  },
  data () {
    return {
      projects: [],
      editingResource: null,
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
    },
    onEditRow (scope) {
      this.editingResource = _.cloneDeep(scope.row)
      scope.row.isEditing = true
      this.$set(this.projects, scope.$index, scope.row)
    },
    onSaveRow (scope) {
      // compute differences between changes with origin
      const changes = {}
      _.forOwn(this.editingResource, (value, key) => {
        if (value !== scope.row[key]) {
          changes[key] = value
        }
      })
      // return if no changes
      if (_.keys(changes).length === 0) {
        this.abortEdit(scope, scope.row)
        this.$notify.warning({ title: 'Warning', message: 'no changes' })
        return
      }
      client.updateProject(scope.row.id, changes).then(() => {
        _.forOwn(changes, (value, key) => {
          scope.row[key] = value
        })
        this.abortEdit(scope, scope.row)
        this.$store.dispatch(statesConst.updateSecurityContext)
        this.$emit('projectUpdated', scope.row)
      }).catch(error => {
        this.$notify.error({ title: 'Error', message: '更新失败' + error })
      })
    },
    onAbortEdit (scope) {
      this.abortEdit(scope, scope.row)
    },
    abortEdit (scope, updateTo) {
      this.editingResource = null
      delete scope.row.isEditing
      this.$set(this.projects, scope.$index, updateTo)
    }
  }
}
</script>

<style scoped>
</style>
