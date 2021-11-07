<template>
  <div>
    <div v-if="property" class="fw-flex fw-flex-v-top">
      <div class="fw-flex fw-flex-v-center">
        <div style="width: 1em">
          <i class="el-icon-tickets"/>
          <!-- <el-tag size="small" effect="dark">{{ property.type }}</el-tag> -->
        </div>
        <div :title="property.name" style="margin: 2px; width: 6em">{{property.title}}</div>
      </div>

      <div style="margin: 2px; flex-grow: 1">
        <div class="fw-flex fw-flex-v-top">
          <!-- value dispaly -->
          <div v-if="property.value" class="fw-flex-grow">
            <el-input type="textarea" readonly autosize size="mini" v-model="property.value"></el-input>
          </div>
          <div v-else style="color: #cccccc">NA</div>

          <!-- value edit -->
          <el-popover placement="top-start" trigger="manual" v-model="editEnabled">
            <div class="fw-flex fw-flex-v-top">
              <el-input type="textarea" autosize size="mini" v-model="editingValue"></el-input>
              <el-button @click="updatePropertyValue"
                style="margin: 2px; padding: 4px 8px;" type="success" size="mini" icon="el-icon-circle-check"/>
              <el-button @click="editEnabled = false; editingValue = ''"
                style="margin: 2px; padding: 4px 8px;" size="mini" icon="el-icon-remove-outline"/>
            </div>
            <span slot="reference">
              <el-button @click="editEnabled = true; editingValue = property.value"
                style="margin: 2px; padding: 4px 8px;" size="mini" icon="el-icon-edit-outline"/>
            </span>
          </el-popover>
        </div>
      </div>
    </div>

    <span v-else>invalid property data</span>
  </div>
</template>

<script>
import { client } from '../../flywheel'

export default {
  name: 'PropertyValueTextarea',
  props: {
    work: null,
    property: null
  },
  data () {
    return {
      editEnabled: false,
      editingValue: ''
    }
  },
  methods: {
    updatePropertyValue () {
      if (this.editingValue.trim().length === 0) {
        this.$notify.warning({ title: 'Warning', message: 'input must not be empty' })
        return
      }

      client.assignWorkPropertyValue(this.work.id, this.property.name, this.editingValue).then((resp) => {
        this.editingValue = ''
        this.editEnabled = false
        this.$emit('workPropertyValueUpdated', resp.data)
      }).catch(err => {
        this.$notify.error({ title: 'process failed', message: err })
      })
    }
  }
}
</script>

<style scoped>
</style>
