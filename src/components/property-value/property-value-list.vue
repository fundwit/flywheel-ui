<template>
  <div>
    <div v-if="properties">
      <div v-for="p in properties" p :key="p.id" style="margin-top: 5px;">
        <property-value-text v-if="p.type === 'text'" :work="work" :property="p" @workPropertyValueUpdated="onWorkPropertyValueUpdated"/>
        <span v-else>unsupported type: {{p.type}} {{p.name}}</span>
      </div>
    </div>
    <div v-else>loading work property values ...</div>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import PropertyValueText from './property-value-text.vue'

export default {
  name: 'PropertyValueList',
  props: {
    work: null
  },
  components: {
    PropertyValueText
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
          this.properties = propValuesOfWorks[0].propertyValues
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
