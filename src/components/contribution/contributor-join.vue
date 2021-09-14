<template>
  <span>
    <el-dropdown size="small">
      <span class="el-dropdown-link">
          <i class="el-icon-plus"/>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-user" @click.native="onAssignToMe">Assign to me</el-dropdown-item>
        <el-dropdown-item icon="el-icon-user" @click.native="showUserSelector = true">Assign to others</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog v-if="showUserSelector === true" title="Select Member" @close="showUserSelector = false" :visible="true" width="300px">
      <project-member-selector :projectId="work.projectId" @projectMemberSelected="onAssingToOthers"/>
    </el-dialog>
  </span>
</template>

<script>
import { client } from '../../flywheel'
import ProjectMemberSelector from '../projectMember/project-member-selector.vue'
// import UserAvatar from '../../userprofile/UserAvatar.vue'
export default {
  name: 'ContributorJoin',
  components: {
    ProjectMemberSelector
  },
  props: {
    work: null,
    contributions: null,
    checkitem: null
  },
  data () {
    return {
      showUserSelector: false
    }
  },
  methods: {
    onAssignToMe () {
      this.memberSelected({ id: this.$store.state.securityContext.identity.id, name: 'yourself' })
    },
    onAssingToOthers (member) {
      this.showUserSelector = false
      this.memberSelected({ id: member.memberId, name: member.memberName })
    },
    memberSelected (assignee) {
      const actionResult = {}
      const target = this.checkitem ? `check item "${this.checkitem.name}"` : `work "${this.work.name}"`
      this.$confirm(`are you want to assign the ${target} to ${assignee.name}?`, 'Confirm', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }).then(() => {
        return client.beginContribution(this.work.identifier, assignee.id, this.checkitem ? this.checkitem.id : 0).then(resp => {
          this.$message({ type: 'success', message: 'action success' })
          actionResult.success = true
        }).catch(err => {
          this.$message({ type: 'error', message: 'action failed: ' + err })
        })
      }).catch(() => {
      }).finally(() => {
        if (actionResult.success) {
          this.$emit('workContributionChanged', this.work)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
