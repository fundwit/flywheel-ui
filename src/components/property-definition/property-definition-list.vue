<template>
  <div>
    <el-dropdown size="small">
      <span class="el-dropdown-link">
          <i class="el-icon-plus"/> Property
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-plus" @click.native="propertyCreating = 'text'">Text Property</el-dropdown-item>
        <el-dropdown-item v-if="false" icon="el-icon-plus" @click.native="onCreateNumberProperty">Number Property</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <div v-if="propertyDefinitions">
      <div v-for="p in propertyDefinitions" p :key="p.id" style="margin-top: 5px;">
        <property-definition-item v-if="p.type === 'text'" :property="p" @action-result="onPropertyDefinitionChanged"/>
        <property-definition-item v-else-if="p.type === 'textarea'" :property="p" @action-result="onPropertyDefinitionChanged"/>
        <property-definition-item v-else-if="p.type === 'number'" :property="p" @action-result="onPropertyDefinitionChanged"/>
        <property-definition-item v-else-if="p.type === 'time'" :property="p" @action-result="onPropertyDefinitionChanged"/>
        <property-definition-item v-else-if="p.type === 'select'" :property="p" @action-result="onPropertyDefinitionChanged"/>
        <span v-else>unsupported type: {{p.type}} {{p.name}}</span>
      </div>
    </div>
    <div v-else>loading workflow property definitions ...</div>

    <el-dialog v-if="propertyCreating" title="Create Property" :visible="true" width="80%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <property-definition-edit :workflowId="workflowId" @action-result="onPropertyCreateActionResult"/>
    </el-dialog>

  </div>
</template>

<script>
import { client } from '../../flywheel'
import PropertyDefinitionItem from './property-definition-item.vue'
import PropertyDefinitionEdit from './property-definition-edit.vue'

export default {
  name: 'PropertyDefinitionList',
  props: {
    workflowId: null
  },
  components: {
    PropertyDefinitionItem,
    PropertyDefinitionEdit
  },
  mounted () {
    this.loadPropertyDefinitions()
  },
  data () {
    return {
      propertyCreating: '',
      propertyDefinitions: null
    }
  },
  methods: {
    onCreateNumberProperty () {
    },
    onPropertyCreateActionResult () {
      this.propertyCreating = ''
      this.loadPropertyDefinitions()
    },
    onPropertyDefinitionChanged () {
      this.loadPropertyDefinitions()
    },
    loadPropertyDefinitions () {
      if (!this.workflowId) {
        return
      }
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.listWorkflowPropertyDefinitions(this.workflowId).then((resp) => {
        this.propertyDefinitions = resp
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    }
  }
}
</script>

<style scoped>
</style>
