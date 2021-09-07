<template>
  <el-card class="box-card" style="width: 80%; margin: 1rem auto">
    <div>Project Detail {{this.$route.params.id}}</div>
    <div v-if="!this.$route.params.id">project id is not specified</div>

    <div>Labels</div>

    <el-button v-if="projectAdmin" type="primary" size="mini" @click="onCreateProjectLabelDialog" icon="el-icon-circle-plus-outline">添加标签</el-button>

    <el-table :data="labels" style="width: 100%">
      <el-table-column label="Name" width="300">
        <template slot-scope="scope">
          <el-tag :key="scope.row.name" class="work-type-label" :style="{ backgroundColor: scope.row.themeColor }" effect="dark">
            {{scope.row.name}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Create Time">
        <template slot-scope="scope">
          {{scope.row.createTime}}
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template slot-scope="scope">
          <project-label-deletion v-if="projectAdmin" :projectLabel="scope.row" @projectLabelDeleted="onProjectLabelDeleted"/>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-if="showProjectLabelCreatingDialog === true" title="Add Project Label" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <project-label-creation :projectId="this.$route.params.id" @action-result="onProjectLabelCreationResult"/>
    </el-dialog>
  </el-card>
</template>

<script>
import client from '../../flywheel'
import ProjectLabelDeletion from './project-labels-deletion.vue'
import ProjectLabelCreation from './project-labels-creation.vue'

export default {
  name: 'ProjectMembers',
  components: {
    ProjectLabelDeletion,
    ProjectLabelCreation
  },
  data () {
    return {
      labels: [],
      showProjectLabelCreatingDialog: false
    }
  },
  mounted () {
    this.loadProjectLabels()
  },
  watch: {
    $route: {
      handler () {
        this.loadProjectLabels()
      },
      deep: true
    }
  },
  computed: {
    projectAdmin () {
      return this.hasRole('system:admin') || this.hasRole('manager_' + this.$route.params.id)
    }
  },
  methods: {
    onCreateProjectLabelDialog () {
      this.showProjectLabelCreatingDialog = true
    },
    onProjectLabelCreationResult () {
      this.showProjectLabelCreatingDialog = false
      this.loadProjectLabels()
    },
    loadProjectLabels () {
      const projectId = this.$route.params.id
      if (!projectId) {
        return
      }
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryProjectLabels(projectId).then((resp) => {
        vue.labels = resp
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onProjectLabelDeleted (val) {
      if (val) {
        this.loadProjectLabels()
      }
    }
  }
}
</script>

<style scoped>
.work-type-label {
  line-height: 20px;
  height: 24px;
  padding: 0 5px;
  margin-right: 5px;
}
</style>
