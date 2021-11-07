<template>
  <div>
    <div v-if="properties">
      <div v-for="p in properties" p :key="p.id" style="margin-top: 5px;">
        <property-value-text v-if="p.type === 'text'" :work="work" :property="p" @workPropertyValueUpdated="onWorkPropertyValueUpdated"/>
        <property-value-textarea v-else-if="p.type === 'textarea'" :work="work" :property="p" @workPropertyValueUpdated="onWorkPropertyValueUpdated"/>
        <property-value-number v-else-if="p.type === 'number'" :work="work" :property="p" @workPropertyValueUpdated="onWorkPropertyValueUpdated"/>
        <property-value-time v-else-if="p.type === 'time'" :work="work" :property="p" @workPropertyValueUpdated="onWorkPropertyValueUpdated"/>
        <property-value-select v-else-if="p.type === 'select'" :work="work" :property="p" @workPropertyValueUpdated="onWorkPropertyValueUpdated"/>
        <span v-else>unsupported type: {{p.type}} {{p.name}}</span>
      </div>
    </div>
    <div v-else>loading work property values ...</div>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import _ from 'lodash'
import PropertyValueText from './property-value-text.vue'
import PropertyValueTextarea from './property-value-textarea.vue'
import PropertyValueNumber from './property-value-number.vue'
import PropertyValueTime from './property-value-time.vue'
import PropertyValueSelect from './property-value-select.vue'

export default {
  name: 'PropertyValueList',
  props: {
    work: null,
    textareaOnly: null,
    textareaIgnore: null
  },
  components: {
    PropertyValueText,
    PropertyValueTextarea,
    PropertyValueNumber,
    PropertyValueTime,
    PropertyValueSelect
  },
  mounted () {
    this.loadPropertyValues()
  },
  data () {
    return {
      properties: null
    }
  },
  methods: {
    onWorkPropertyValueUpdated () {
      this.loadPropertyValues()
    },
    loadPropertyValues () {
      if (!this.work || !this.work.id) {
        return
      }

      client.queryWorkPropertyValues(this.work.id).then((propValuesOfWorks) => {
        if (propValuesOfWorks && propValuesOfWorks.length > 0) {
          const props = propValuesOfWorks[0].propertyValues
          if (this.textareaOnly === true) {
            this.properties = _.filter(props, p => p.type === 'textarea')
          } else if (this.textareaIgnore === true) {
            this.properties = _.filter(props, p => p.type !== 'textarea')
          } else {
            this.properties = props
          }
        } else {
          this.properties = []
        }
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      })
    }
  }
}
</script>

<style scoped>
</style>
