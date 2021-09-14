<template>
      <el-dropdown size="small">
        <span class="el-dropdown-link">
          <user-avatar :rounded="contribution.endTime != null" style="margin-right: 3px"
            :userId="contribution.contributorId" :username="contribution.contributorName"/>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item icon="el-icon-user" v-if="contribution.endTime == null"
            @click.native="finishContribution(contribution, true)">Complete Contribution</el-dropdown-item>
          <el-dropdown-item icon="el-icon-user"
            @click.native="finishContribution(contribution, false)">Discard Contribution</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
</template>

<script>
import { client } from '../../flywheel'
import UserAvatar from '../../userprofile/UserAvatar'
export default {
  name: 'Contributor',
  components: {
    UserAvatar
  },
  props: {
    work: null,
    contribution: null
  },
  data () {
    return {
    }
  },
  methods: {
    finishContribution (contribution, effective) {
      const actionResult = {}
      const contributorName = contribution.contributorId === this.$store.state.securityContext.identity.id ? 'yourself' : contribution.contributorName
      this.$confirm(`are you really want to ${effective ? 'finish' : 'discard'} ${contributorName}'s contribution on the work "${this.work.name}" ?`, 'Confirm', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }).then(() => {
        return client.finishContribution(this.work.identifier, contribution.contributorId, contribution.checkitemId, effective).then(resp => {
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
