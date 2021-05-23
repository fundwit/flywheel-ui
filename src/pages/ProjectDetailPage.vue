<template>
  <el-card class="box-card" style="width: 80%; margin: 1rem auto">
    <div>Project Detail {{this.$route.params.id}}</div>
    <div v-if="!this.$route.params.id">project id is not specified</div>

    <div>Members</div>
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
          <el-button @click="onEditWorkflowDialog(scope)" type="text" size="small">编辑</el-button>
          <!-- <workflow-delete v-if="!scope.row.isEditing" :workflow="scope.row" @workflowDeleted="onWorkflowDeleted"/> -->
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import client from '../flywheel'

export default {
  name: 'ProjectDetailPage',
  components: {
  },
  data () {
    return {
      members: []
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
  methods: {
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
    }
  }
}
</script>

<style scoped>

</style>
