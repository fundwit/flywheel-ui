<template>
  <el-card class="box-card" style="width: 80%; margin: 1rem auto">
    <el-table :data="workflows" style="width: 100%">
      <el-table-column prop="id" label="ID" width="180">
      </el-table-column>
      <el-table-column prop="name" label="Name" width="300">
        <template slot-scope="scope">
          <router-link :to="{ name: 'WorkflowDetail', params: { id: scope.row.id }}">{{scope.row.name}}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="States">
        <template slot-scope="scope">
          <el-tag v-for="state in scope.row.stateMachine.states" :key="state.name" :type="mapStateCategory(state.category).style" effect="dark">
            {{ state.name }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import client from '../flywheel'

export default {
  name: 'WorkflowList',
  data () {
    return {
      total: 0,
      workflows: []
    }
  },
  mounted () {
    this.loadWorkflows()
  },
  methods: {
    mapStateCategory (category) {
      if (category === 0) {
        return {
          style: ''
        }
      } else if (category === 1) {
        return {
          style: 'warning'
        }
      } else if (category === 2) {
        return {
          style: 'info'
        }
      }
    },
    loadWorkflows () {
      const groupId = this.$route.query.projectId
      if (!groupId) {
        return
      }
      const vue = this

      // mask
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
