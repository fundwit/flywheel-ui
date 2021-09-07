<template>
  <el-button type="danger" size="mini" icon="el-icon-delete" @click="onDeleteConfirm">Delete</el-button>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'ProjectLabelDelete',
  props: {
    projectLabel: null
  },
  methods: {
    onDeleteConfirm () {
      const vue = this
      const deleteOutput = {}
      this.$prompt(`label "${this.projectLabel.name}" will be delete. Input label name to confirm`, 'Action Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: v => v === this.projectLabel.name,
        inputErrorMessage: 'invalid input'
      }).then(({ value }) => {
        if (value === this.projectLabel.name) {
          return client.deleteProjectLabel(vue.projectLabel.id).then(resp => {
            vue.$message({ type: 'success', message: 'delete success' })
            deleteOutput.result = true
          }).catch(err => {
            vue.$message({ type: 'error', message: 'delete failed: ' + err.response.data.message })
          })
        }
      }).catch(() => {
      }).finally(() => {
        if (deleteOutput.result) {
          vue.$emit('projectLabelDeleted', vue.projectLabel)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
