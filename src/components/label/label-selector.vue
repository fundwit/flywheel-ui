<template>
  <span>
    <span v-if="loadingError" style="color: red">{{ loadingError }}</span>

    <el-autocomplete v-if="selectEnabled" v-model="selectedLabel" :fetch-suggestions="loadLabels" placeholder="请输入内容"
     @select="handleSelect" size="small">
     <i class="el-icon-close el-input__icon" slot="suffix" @click="selectEnabled = false"></i>
      <template slot-scope="{ item }">
        <el-tag :key="item.name" class="work-type-label" effect="dark" :style="{ backgroundColor: item.themeColor}" >
          {{item.name}}
        </el-tag>
      </template>
    </el-autocomplete>

    <el-button v-else class="button-new-tag" size="small" @click="selectEnabled = true">+ Label</el-button>
  </span>
</template>

<script>
import _ from 'lodash'
import { client } from '../../flywheel'
export default {
  name: 'LabelSelector',
  props: {
    projectId: null,
    labelFilters: null
  },
  data () {
    return {
      selectEnabled: false,
      selectedLabel: '',
      loadingError: null
    }
  },
  methods: {
    loadLabels (query, cb) {
      if (!this.projectId) {
        this.loadingError = 'project id is empty'
        return
      }
      const vue = this
      client.queryProjectLabels(this.projectId, query).then(resp => {
        if (vue.labelFilters) {
          const labels = _.filter(resp, s => !_.find(vue.labelFilters, f => f.id === s.id))
          cb(labels)
        } else {
          cb(resp)
        }
      }).catch(err => {
        vue.loadingError = err
      }).finally(() => {
      })
    },

    handleSelect (label) {
      this.$emit('labelSelected', label)
      this.selectEnabled = false
    }
  }
}
</script>

<style scoped>
.work-type-label {
  line-height: 20px;
  height: 24px;
  padding: 0 5px;
  margin-right: 5px;
}
</style>
