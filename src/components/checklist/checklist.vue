<template>
  <div>
    <div style="margin-bottom: 5px">
      <el-button v-if="!inputEnabled" size="mini" @click="inputEnabled = true">+ Check Item</el-button>

      <div v-if="inputEnabled" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">
        <el-input style="flex-grow: 1" size="mini" placeholder="请输入内容" v-model="inputName"></el-input>
        <el-button style="margin-left: 5px" type="success" @click="addCheckItem" size="mini" icon="el-icon-circle-check">保存</el-button>
        <el-button @click="inputEnabled = false" size="mini" icon="el-icon-remove-outline">取消</el-button>
      </div>
    </div>

    <checkitem v-for="i in work.checklist" :key="i.id" :work="work" :checkitem="i" :contributions="contributions"
      @checkItemsUpdated="onCheckItemsUpdated" @workContributionChanged="onWorkContributionChanged"></checkitem>

  </div>
</template>

<script>
import { client } from '../../flywheel'
import Checkitem from './checkitem.vue'

export default {
  name: 'Checklist',
  components: {
    Checkitem
  },
  props: {
    work: null,
    contributions: null
  },
  data () {
    return {
      inputEnabled: false,
      inputName: ''
    }
  },
  methods: {
    addCheckItem () {
      client.addWorkCheckItem({ workId: this.work.id, name: this.inputName }).then(resp => {
        this.abortEdit()
        if (!this.work.checklist) {
          this.work.checklist = []
        }
        this.work.checklist.push(resp.data)
        this.$emit('checkItemsUpdated', this.work.checklist)
      }).catch(err => {
        this.$notify.error({ title: 'request failed', message: err })
      }).finally(() => {
      })
    },
    onWorkContributionChanged (work) {
      this.$emit('workContributionChanged', work)
    },
    onCheckItemsUpdated (checklist) {
      this.$emit('checkItemsUpdated', checklist)
    },

    abortEdit () {
      this.inputEnabled = false
      this.inputName = ''
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
.work-item-done {
  color: rgb(1, 161, 1);
  border-left: rgb(3, 199, 3) 5px solid;
  background-color: rgb(239, 250, 239);
  margin-bottom: 1px;
}
.work-item-assigned {
  color: rgb(2, 148, 233);
  border-left: rgb(29, 182, 253) 5px solid;
  background-color: rgb(233, 245, 250);
  margin-bottom: 1px;
}
.work-item-pending {
  border-left: rgb(255, 230, 7) 5px solid;
  margin-bottom: 1px;
}
</style>
