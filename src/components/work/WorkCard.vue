<template>
  <div :key="work.name" :data-id="work.id" :data-state="work.stateName" class="list-group-item item">

    <div class="work_id_row" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;"
        :style="{'border-bottom': 'solid 1px ' + workflow.themeColor, }">
      <div class="workflow_type">
        <el-tag key="task" class="work-type-label" :style="{ backgroundColor: workflow.themeColor }" effect="dark">
          <i :class="workflow.themeIcon"/>
          {{workflow.name}}
        </el-tag>
      </div>
      <div class="work_id drag-handler" style="flex-grow: 1; font-size: 0.8rem">
        <span>{{ work.identifier }}</span>
      </div>
      <div class="work_action" style="padding-right: 6px">
        <el-dropdown size="small">
          <span class="el-dropdown-link">
             <i class="el-icon-more"/>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="work.stateCategory == 3 || work.stateCategory == 4" icon="el-icon-setting" @click.native="archiveWork">Archive</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div class="card-content">
      <div class="work_desc_row" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">
        <div class="work-card-title" style="padding-right: 8px">
          <i :class="workflow.themeIcon"/>
        </div>
        <div @click="onWorkDetail(work)" class="work-card-title">
          <v-clamp autoresize :max-lines="2">{{ work.name }}</v-clamp>
        </div>
      </div>

      <!--    <div class="member_trace card-row" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">-->
      <!--      <div style="color: darkorange"><i class="el-icon-warning-outline"/>2/5</div>-->
      <!--      <div style="color: limegreen"><i class="el-icon-circle-check"/>5/5</div>-->
      <!--    </div>-->

      <div class="work_state_row card-row" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">
        <div style="padding-right: 6px">
          <i class="el-icon-s-custom"/>
        </div>
        <avatar :size="25" username="admin xx" style="margin-right: 2px" :rounded="false"/>
        <avatar :size="20" username="admin xx" :rounded="false"/>
      </div>

      <div class="work_trace_row card-row" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">
        <div style="padding-right: 6px">
          <i class="el-icon-timer"/>
        </div>
        <div v-if="work.state.category !== 3 && work.state.category !== 4" style="color: darkorange;">
          S: {{formatTimeDuration(work.stateBeginTime, null)}}
        </div>
        <el-divider direction="vertical"/>
        <div :style="{color: work.state.category !== 3 && work.state.category !== 4 ? 'darkorange' : 'limegreen'}">
         P: {{formatTimeDuration(work.processBeginTime, work.processEndTime)}}
        </div>
        <el-divider direction="vertical"/>
        <div :style="{color: work.state.category !== 3 && work.state.category !== 4 ? 'darkorange' : 'limegreen'}">
         L: {{ formatTimeDuration(work.createTime, work.processEndTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatTime, formatTimeDuration } from '../../times'
import { categoryStyle } from '../../themes'
import Avatar from 'vue-avatar'
import VClamp from 'vue-clamp'
import client from '../../flywheel'

export default {
  name: 'WorkCard',
  components: {
    Avatar,
    VClamp
  },
  props: {
    work: null,
    workflow: null
  },
  methods: {
    formatTime: formatTime,
    formatTimeDuration: formatTimeDuration,
    categoryStyle: categoryStyle,
    onWorkDetail () {
      this.$emit('titleClicked', this.work)
    },
    archiveWork () {
      const vue = this
      const actionResult = {}
      this.$confirm(`work "${this.work.name}" will be archived.`, 'Archive Work', {
        confirmButtonText: 'Archive',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        return client.archiveWorks([this.work.id]).then(resp => {
          vue.$message({ type: 'success', message: 'archive success' })
          actionResult.success = true
        }).catch(err => {
          vue.$message({ type: 'error', message: 'archive failed: ' + err })
        })
      }).catch(() => {
      }).finally(() => {
        if (actionResult.success) {
          vue.$emit('workArchived', vue.work)
        }
      })
    }
  }
}
</script>

<style scoped>
.item{
  padding: 0px;
  width: 300px;
  margin-bottom: 15px;
  background-color: white;
  box-shadow: 0 1px 6px 0 rgba(0,0,0,.1);
}
.item:hover{
  background-color: #fdfdfd;
  box-shadow: 0 2px 12px 1px rgba(0,0,0,.2);
}
.item+.item{
  border-top:none ;
  margin-top: 6px;
}
.work-card-title {
  height: 2.5rem;
  word-wrap:break-word;
  word-break:break-all;
  overflow: hidden;
  line-height: 1.2rem;
}
.work-type-label {
  line-height: 20px;
  height: 24px;
  padding: 0 5px;
  margin-right: 5px;
}
.card-content {
  padding: 8px 8px 0 8px;
  font-size: 0.8rem;
  color: #929191;
}
.card-row {
  padding-bottom: 8px
}
.el-dropdown-link{
  cursor: pointer;
}
</style>
