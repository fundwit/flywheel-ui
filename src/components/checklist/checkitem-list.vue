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

    <div v-for="i in work.checklist" :key="i.id"
     :class="i.done ? 'work-item-done':(i.assigned ? 'work-item-assigned': 'work-item-pending')"
      style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">

      <div style="margin: 2px">
        <el-checkbox :disabled="editedCheckItemId != null" v-model="i.done" @change="updateCheckItemState(i.id, !i.done)"/>
      </div>
      <div v-if="false" style="margin: 2px">
        <el-checkbox :disabled="editedCheckItemId != null" v-model="i.assigned"/>
      </div>

      <div v-if="editedCheckItemId != i.id" style="margin: 2px; flex-grow: 1">{{i.name}}</div>
      <el-button v-if="!editedCheckItemId" style="margin: 2px; padding: 4px 8px;" type="primary" size="mini"
       @click="editedCheckItemId = i.id; editedCheckItemName = i.name" icon="el-icon-edit-outline"></el-button>

      <el-button v-if="!editedCheckItemId" style="margin: 2px; padding: 4px 8px;" @click="deleteCheckItem(i.id)"
       type="danger" size="mini" icon="el-icon-circle-close"></el-button>

      <el-input v-if="editedCheckItemId == i.id" v-model="editedCheckItemName"
        style="flex-grow: 1" size="mini" placeholder="请输入内容"></el-input>
      <el-button v-if="editedCheckItemId == i.id"  @click="updateCheckItemName"
        style="margin: 2px; padding: 4px 8px;" type="success" size="mini" icon="el-icon-circle-check"/>
      <el-button v-if="editedCheckItemId == i.id" @click="editedCheckItemId = null; editedCheckItemName = null"
        style="margin: 2px; padding: 4px 8px;" size="mini" icon="el-icon-remove-outline"/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { client } from '../../flywheel'
export default {
  name: 'CheckitemList',
  props: {
    work: null
  },
  data () {
    return {
      inputEnabled: false,
      inputName: '',

      editedCheckItemId: null,
      editedCheckItemName: null
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
    deleteCheckItem (id) {
      const idx = _.findIndex(this.work.checklist, i => i.id === id)
      if (idx < 0) {
        return
      }

      this.$prompt(`check item "${this.work.checklist[idx].name}" will be delete. Input 'DELETE' to confirm`, 'Action Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: v => v === 'DELETE',
        inputErrorMessage: 'invalid input'
      }).then(({ value }) => {
        if (value === 'DELETE') {
          client.deleteWorkCheckItem(id).then(() => {
            this.abortEdit()
            this.$emit('checkItemsUpdated', _.filter(this.work.checklist, i => i.id !== id))
          }).catch(err => {
            this.$notify.error({ title: 'request failed', message: err })
          })
        }
      })
    },
    updateCheckItemName () {
      if (this.editedCheckItemName.trim().length === 0) {
        this.$notify.warning({ title: 'Warning', message: 'input must not be empty' })
        return
      }

      client.updateWorkCheckItem(this.editedCheckItemId, { name: this.editedCheckItemName }).then(() => {
        const idx = _.findIndex(this.work.checklist, i => i.id === this.editedCheckItemId)
        if (idx < 0) {
          return
        }
        this.work.checklist[idx].name = this.editedCheckItemName

        this.editedCheckItemId = null
        this.editedCheckItemName = null
        this.$emit('checkItemsUpdated', this.work.checklist)
      }).catch(err => {
        this.$notify.error({ title: 'request failed', message: err })
      })
    },
    updateCheckItemState (id, oldState) {
      const idx = _.findIndex(this.work.checklist, i => i.id === id)
      if (idx < 0) {
        return
      }

      client.updateWorkCheckItem(id, { done: !oldState }).then(() => {
        this.editedCheckItemId = null
        this.editedCheckItemName = null
        this.$emit('checkItemsUpdated', this.work.checklist)
      }).catch(err => {
        this.work.checklist[idx].done = oldState // reset done state
        this.$notify.error({ title: 'request failed', message: err })
      })
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
