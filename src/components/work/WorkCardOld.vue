<template>
  <div :key="work.name" :data-id="work.id" :data-state="work.stateName" class="list-group-item item">
    <el-row type="flex" justify="space-between">
      <el-col :span="20">
        <div class="drag-handler">
          <el-tag key="task" class="work-type-label" :style="{ backgroundColor: workflow.themeColor }" effect="dark">
            <i :class="workflow.themeIcon"/>
            {{workflow.name}}
          </el-tag>
          <span>{{work.id}}</span>
        </div>
        <div @click="onWorkDetail(work)" class="work-card-title">
          {{ work.name }}
        </div>
      </el-col>
      <el-col :span="3">
        <Avatar username="admin xx" :rounded="false"/>
      </el-col>
    </el-row>

    <div>
      <i class="el-icon-stopwatch"/>
      <span v-if="work.state.category !== 2">{{formatTimeDuration(work.stateBeginTime, null)}} | </span>
      {{formatTimeDuration(work.processBeginTime, work.processEndTime)}}
      |
      {{ formatTime(work.createTime) }}
    </div>
  </div>
</template>

<script>
import { formatTime, formatTimeDuration } from '../../times'
import { categoryStyle } from '../../themes'
import Avatar from 'vue-avatar'
export default {
  name: 'WorkCardOld',
  components: {
    Avatar
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
    }
  }
}
</script>

<style scoped>
.item{
  padding: 12px;
  width: 273px;
  margin-bottom: 15px;
  border:  solid 1px #eee;
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
  font-size: 0.8rem;
  padding: 10px 0;
  height: 3rem;
  word-wrap:break-word;
  word-break:break-all;
  overflow: hidden;
  line-height: 1.5rem;
  color: #929191;
}
.work-type-label {
  line-height: 20px;
  height: 24px;
  padding: 0 5px;
  margin-right: 5px;
}
</style>
