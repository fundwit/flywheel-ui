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
      this.$prompt(`user "${this.projectMember.name}" will be leave project. Input user name to confirm`, 'Action Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputPattern: this.projectMember.name,
        inputErrorMessage: 'invalid input'
      }).then(({ value }) => {
        if (value === this.projectMember.name) {
          return client.deleteProjectMember(vue.projectMember.projectId, vue.projectMember.userId).then(resp => {
            ....
            vue.$message({ type: 'success', message: 'delete success' })
            deleteOutput.result = true
          }).catch(err => {
            vue.$message({ type: 'error', message: 'delete failed: ' + err.response.data.message })
          })
        }
      }).catch(() => {
      }).finally(() => {
        if (deleteOutput.result) {
          vue.$emit('workflowDeleted', vue.workflow)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
