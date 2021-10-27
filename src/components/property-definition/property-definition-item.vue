<template>
  <div>
    <div v-if="property" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">
      <el-tag size="small" effect="dark">{{ property.type }}</el-tag>
      <div style="margin: 2px;">{{property.name}}</div>
      <div style="margin: 2px; flex-grow: 1">{{property.title}}</div>

      <div>
        <property-select-option v-if="property.type === 'select'" :editable="false" :initOptions="property.options"/>
      </div>
      <el-button v-if="editable" style="margin: 2px; padding: 4px 8px;" type="primary" size="mini" icon="el-icon-edit-outline"></el-button>
      <el-button @click="deleteProperty" style="margin: 2px; padding: 4px 8px;" type="danger" size="mini" icon="el-icon-circle-close"></el-button>
    </div>

    <span v-else>invalid property data</span>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import PropertySelectOption from './property-select-option.vue'

export default {
  name: 'PropertyDefinitionItem',
  components: {
    PropertySelectOption
  },
  props: {
    property: null
  },
  data () {
    return {
      editable: false
    }
  },
  methods: {
    deleteProperty () {
      if (!this.property || !this.property.id) {
        this.$notify.error({ title: 'Error', message: '参数错误' })
        return
      }

      this.$prompt(`property definition "${this.property.name}" will be deleted. deletion action is unrecoverable, input "${this.property.name}" to confirm.`, 'Delete Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: v => v === this.property.name,
        inputErrorMessage: 'invalid input'
      }).then(({ input }) => {
        const mask = this.$loading({ lock: true, text: 'Processing...', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
        client.deleteWorkflowProperty(this.property.id).then(() => {
          this.$message({ type: 'success', message: 'delete success' })
          this.$emit('action-result', true)
        }).catch((error) => {
          this.$notify.error({ title: 'Error', message: error })
        }).finally(() => {
          mask.close()
        })
      })
    }
  }
}
</script>

<style scoped>
</style>
