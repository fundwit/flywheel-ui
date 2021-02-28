<template>
  <el-button type="danger" size="mini" icon="el-icon-delete" @click="onDeleteConfirm">Delete</el-button>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'WorkDelete',
  props: {
    work: null
  },
  methods: {
    onDeleteConfirm () {
      const vue = this
      const deleteOutput = {}
      this.$prompt(`work "${this.work.name}" will be deleted. deletion action is unrecoverable, input "DELETE" to confirm it.`, 'Delete Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputPattern: /DELETE/,
        inputErrorMessage: 'invalid input'
      }).then(({ value }) => {
        if (value === 'DELETE') {
          return client.deleteWork(this.work.id).then(resp => {
            vue.$message({ type: 'success', message: 'delete success' })
            deleteOutput.result = true
          }).catch(err => {
            vue.$message({ type: 'danger', message: 'delete failed: ' + err })
          })
        }
      }).catch(() => {
      }).finally(() => {
        if (deleteOutput.result) {
          vue.$emit('workDeleted', vue.work)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
