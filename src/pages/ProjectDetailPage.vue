<template>
  <el-card class="box-card" style="width: 80%; margin: 1rem auto">
    <div>Project Detail {{this.$route.params.id}}</div>
    <div v-if="!this.$route.params.id">project id is not specified</div>

    <div>Members</div>

    <el-button v-if="projectAdmin" type="primary" size="mini" @click="onCreateProjectMemberDialog" icon="el-icon-circle-plus-outline">添加成员</el-button>

    <el-table :data="members" style="width: 100%">
      <el-table-column label="Member" width="300">
        <template slot-scope="scope">
          {{scope.row.memberName}}
        </template>
      </el-table-column>
      <el-table-column label="Role" width="300">
        <template slot-scope="scope">
          {{scope.row.role}}
        </template>
      </el-table-column>
      <el-table-column label="Enroll Time">
        <template slot-scope="scope">
          {{scope.row.createTime}}
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template slot-scope="scope">
          <project-member-delete v-if="projectAdmin" :projectMember="scope.row" @projectMemberDeleted="onProjectMemberDeleted"/>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-if="showProjectMemberCreatingDialog === true" title="Add Project Member" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <project-member-creation :projectId="this.$route.params.id" @action-result="onProjectMemberCreationResult"/>
    </el-dialog>
  </el-card>
</template>

<script>
import client from '../flywheel'
import ProjectMemberDelete from '../components/projectMember/ProjectMemberDelete'
import ProjectMemberCreation from '../components/projectMember/ProjectMemberCreation'

export default {
  name: 'ProjectDetailPage',
  components: {
    ProjectMemberDelete,
    ProjectMemberCreation
  },
  data () {
    return {
      members: [],
      showProjectMemberCreatingDialog: false
    }
  },
  mounted () {
    this.loadProjectMembers()
  },
  watch: {
    $route: {
      handler () {
        this.loadProjectMembers()
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
    onCreateProjectMemberDialog () {
      this.showProjectMemberCreatingDialog = true
    },
    onProjectMemberCreationResult () {
      this.showProjectMemberCreatingDialog = false
      this.loadProjectMembers()
    },
    loadProjectMembers () {
      const projectId = this.$route.params.id
      if (!projectId) {
        return
      }
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryProjectMembers(projectId).then((resp) => {
        vue.members = resp.data
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onProjectMemberDeleted (val) {
      if (val) {
        this.loadProjectMembers()
      }
    }
  }
}
</script>

<style scoped>

</style>
