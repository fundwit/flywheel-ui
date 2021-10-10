<template>
  <el-button type="danger" size="mini" icon="el-icon-delete" @click="onDeleteConfirm">Delete</el-button>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'ProjectMemberDelete',
  props: {
    projectMember: null
  },
  methods: {
    onDeleteConfirm () {
      const vue = this
      const deleteOutput = {}
      this.$prompt(`user "${this.projectMember.memberName}" will be leave project. Input member name to confirm`, 'Action Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: v => v === this.projectMember.memberName,
        inputErrorMessage: 'invalid input'
      }).then(({ input }) => {
        return client.deleteProjectMember(vue.projectMember.projectId, vue.projectMember.memberId).then(resp => {
          vue.$message({ type: 'success', message: 'delete success' })
          deleteOutput.result = true
        }).catch(err => {
          vue.$message({ type: 'error', message: 'delete failed: ' + err.response.data.message })
        })
      }).catch(() => {
      }).finally(() => {
        if (deleteOutput.result) {
          vue.$emit('projectMemberDeleted', vue.projectMember)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
