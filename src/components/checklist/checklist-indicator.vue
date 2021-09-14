<template>
    <span :class="checklistFinished ? 'checklist-done' : ''">
      <i :class="checklistFinished ? 'el-icon-document-checked': 'el-icon-tickets'"/>
      {{finishedItems.length}}/{{checklist.length}}
    </span>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'ChecklistIndicator',
  props: {
    checklist: null
  },
  data () {
    return {
    }
  },
  computed: {
    checklistFinished () {
      return this.finishedItems.length === this.checklist.length && this.checklist.length > 0
    },
    finishedItems () {
      return _.filter(this.checklist, i => i.done)
    }
  }
}
</script>

<style scoped>
.checklist-done {
  color: green;
}
</style>
