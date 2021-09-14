<template>
  <span>
    <el-autocomplete v-model="selectedMember" placeholder="请输入内容"
      :fetch-suggestions="queryProjectMembersAsync" @select="handleSelect">
      <template slot-scope="{ item }">
        <span>{{ item.memberName }}</span> - <span>{{ item.role }}</span>
      </template>
    </el-autocomplete>
  </span>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'ProjectMemberSelector',
  props: {
    projectId: null,
    excluded: null
  },
  data () {
    return {
      selectedMember: null,
      actionResult: null
    }
  },
  methods: {
    queryProjectMembersAsync (queryString, cb) {
      client.queryProjectMembers(this.projectId, queryString).then((resp) => {
        cb(resp.data)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      })
    },
    handleSelect (m) {
      this.$emit('projectMemberSelected', m)
    }
  }
}
</script>

<style scoped>
</style>
