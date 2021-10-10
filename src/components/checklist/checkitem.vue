<template>
    <div  :class="checkitem.done ? 'work-item-done':(checkitem.assigned ? 'work-item-assigned': 'work-item-pending')"
      style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">

      <div style="margin: 2px">
        <el-checkbox :disabled="editEnabled" v-model="checkitem.done"
           @change="updateCheckItemState(checkitem.id, !checkitem.done)"/>
      </div>
      <div v-if="false" style="margin: 2px">
        <el-checkbox :disabled="editEnabled" v-model="checkitem.assigned"/>
      </div>

      <div v-if="!editEnabled" style="margin: 2px; flex-grow: 1">{{checkitem.name}}</div>

      <contributor v-for="c in checkitemContributions" :key="c.id" :work="work" :contribution="c"
        @workContributionChanged="onWorkContributionChanged"/>

      <contributor-join v-if="!editEnabled && checkitemContributions.length === 0" :work="work" :contributions="contributions" :checkitem="checkitem"
        @workContributionChanged="onWorkContributionChanged"/>

      <el-button v-if="!editEnabled" style="margin: 2px; padding: 4px 8px;" type="primary" size="mini"
       @click="editEnabled = true; editName = checkitem.name" icon="el-icon-edit-outline"></el-button>

      <el-button v-if="!editEnabled" style="margin: 2px; padding: 4px 8px;" @click="deleteCheckItem(checkitem.id)"
       type="danger" size="mini" icon="el-icon-circle-close"></el-button>

      <el-input v-if="editEnabled" v-model="editName"
        style="flex-grow: 1" size="mini" placeholder="请输入内容"></el-input>
      <el-button v-if="editEnabled"  @click="updateCheckItemName"
        style="margin: 2px; padding: 4px 8px;" type="success" size="mini" icon="el-icon-circle-check"/>
      <el-button v-if="editEnabled" @click="editEnabled = false; editName = null"
        style="margin: 2px; padding: 4px 8px;" size="mini" icon="el-icon-remove-outline"/>
    </div>

</template>

<script>
import _ from 'lodash'
import { client } from '../../flywheel'
import ContributorJoin from '../contribution/contributor-join.vue'
import Contributor from '../contribution/contributor.vue'
export default {
  name: 'Checkitem',
  components: {
    ContributorJoin,
    Contributor
  },
  props: {
    work: null,
    checkitem: null,
    contributions: null
  },
  data () {
    return {
      editEnabled: false,
      editName: null
    }
  },
  computed: {
    checkitemContributions () {
      return _.filter(this.contributions, c => c.checkitemId === this.checkitem.id && c.effective)
    }
  },
  methods: {
    checkitemAssignee (checkitem) {
      return _.find(this.contributions, c => c.checkitemId === checkitem.id)
    },
    onWorkContributionChanged (work) {
      this.$emit('workContributionChanged', work)
    },
    deleteCheckItem (id) {
      const idx = _.findIndex(this.work.checklist, c => c.id === id)
      if (idx < 0) {
        return
      }

      this.$prompt(`check item "${this.work.checklist[idx].name}" will be delete. Input 'DELETE' to confirm`, 'Action Confirm', {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: v => v === 'DELETE',
        inputErrorMessage: 'invalid input'
      }).then(({ input }) => {
        client.deleteWorkCheckItem(id).then(() => {
          this.$emit('checkItemsUpdated', _.filter(this.work.checklist, c => c.id !== id))
        }).catch(err => {
          this.$notify.error({ title: 'request failed', message: err })
        })
      })
    },
    updateCheckItemName () {
      if (this.editName.trim().length === 0) {
        this.$notify.warning({ title: 'Warning', message: 'input must not be empty' })
        return
      }

      client.updateWorkCheckItem(this.checkitem.id, { name: this.editName }).then(() => {
        const idx = _.findIndex(this.work.checklist, c => c.id === this.checkitem.id)
        if (idx < 0) {
          return
        }

        this.work.checklist[idx].name = this.editName
        this.checkitem.name = this.editName
        this.editName = null
        this.editEnabled = false
        this.$emit('checkItemsUpdated', this.work.checklist)
      }).catch(err => {
        this.$notify.error({ title: 'request failed', message: err })
      })
    },
    updateCheckItemState (id, oldState) {
      const idx = _.findIndex(this.work.checklist, c => c.id === id)
      if (idx < 0) {
        return
      }

      client.updateWorkCheckItem(id, { done: !oldState }).then(() => {
        this.editName = null
        this.$emit('checkItemsUpdated', this.work.checklist)
      }).catch(err => {
        this.work.checklist[idx].done = oldState // reset done state
        this.$notify.error({ title: 'request failed', message: err })
      })
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
