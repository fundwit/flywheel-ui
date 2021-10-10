<template>
  <el-button type="danger" size="mini" icon="el-icon-delete" @click="onDeleteConfirm">Delete</el-button>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'WorkflowDelete',
  props: {
    workflow: null
  },
  methods: {
    onDeleteConfirm () {
      const vue = this
      const deleteOutput = {}
      this.$prompt(`workflow "${this.workflow.name}" will be deleted. deletion action is unrecoverable, input "DELETE" to confirm.`, 'Delete Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputPattern: /DELETE/,
        inputErrorMessage: 'invalid input'
      }).then(({ input }) => {
        return client.deleteWorkflow(this.workflow.id).then(resp => {
          vue.$message({ type: 'success', message: 'delete success' })
          deleteOutput.result = true
        }).catch(err => {
          vue.$message({ type: 'error', message: 'delete failed: ' + err.response.data.message })
        })
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
