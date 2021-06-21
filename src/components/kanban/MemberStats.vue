<template>
  <div>
    Member Stats
    <el-table :data="members" :row-style="{padding: 0}" :cell-style="{padding: '3px'}">
      <el-table-column width="30">
        <template slot-scope="scope">
          <i :class="scope.row.role === 'manager' ? 'el-icon-user' : 'el-icon-chat-round'" :title="scope.row.role"/>
        </template>
      </el-table-column>
      <el-table-column prop="memberName" width="50">
        <template slot-scope="scope">
          <avatar :size="20" :username="scope.row.memberName" :title="scope.row.memberName"
            style="margin-right: 2px" :rounded="memberWorkStats[scope.row.memberId].wipCount === 0"/>
        </template>
      </el-table-column>
      <el-table-column prop="wipCount" label="WIP" width="50">
        <template slot-scope="scope">
          {{memberWorkStats[scope.row.memberId] ? memberWorkStats[scope.row.memberId].wipCount : 0}}
        </template>
      </el-table-column>
      <el-table-column prop="done" label="D" width="50">
        <template slot-scope="scope">
          {{memberWorkStats[scope.row.memberId] ? memberWorkStats[scope.row.memberId].done : 0}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import _ from 'lodash'
import Avatar from 'vue-avatar'

export default {
  name: 'MemberStats',
  components: {
    Avatar
  },
  props: {
    projectId: null,
    workContributions: null
  },
  data () {
    return {
      members: []
    }
  },
  computed: {
    memberWorkStats () {
      const compuatedStats = {}
      _.forEach(this.members, (memberRole) => {
        compuatedStats[memberRole.memberId] = { wipCount: 0, done: 0 }
      })

      _.forEach(this.workContributions, (contribs) => {
        _.forEach(contribs, (contrib) => {
          const stats = compuatedStats[contrib.contributorId]
          if (stats) {
            if (contrib.endTime) {
              stats.done++
            } else {
              stats.wipCount++
            }
          }
        })
      })
      return compuatedStats
    }
  },
  mounted () {
    this.loadProjectMembers()
  },
  watch: {
    projectId (val) {
      this.loadProjectMembers()
    }
  },
  methods: {
    loadProjectMembers () {
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.queryProjectMembers(this.projectId).then((resp) => {
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
