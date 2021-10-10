<template>
  <div>
    <el-form ref="form" :model="property" label-width="200px">
      <el-form-item label="Property Type">
        <el-input disabled v-model="property.type"></el-input>
      </el-form-item>
      <el-form-item label="Property Name">
        <el-input v-model="property.name"></el-input>
      </el-form-item>
      <el-form-item label="Display Title">
        <el-input v-model="property.title"></el-input>
      </el-form-item>
    </el-form>

    <el-divider style="margin: 0"/>
    <el-button type="primary" @click="onSubmit">Submit</el-button>
    <el-button @click="onCancel">Cancel</el-button>
  </div>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'PropertyTextEdit',
  props: {
    workflowId: null
  },
  data () {
    return {
      property: {
        type: 'text',
        name: '',
        title: ''
      }
    }
  },
  methods: {
    onCancel () {
      this.$emit('action-result', null)
    },
    onSubmit () {
      if (!this.workflowId || !this.property || !this.property.name) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      const mask = this.$loading({ lock: true, text: 'Processing...', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.createWorkflowProperty(this.workflowId, {
        type: this.property.type,
        name: this.property.name,
        title: this.property.title
      }).then((resp) => {
        this.$emit('action-result', resp)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: error })
      }).finally(() => {
        mask.close()
      })
    }
  }
}
</script>

<style scoped>
</style>
