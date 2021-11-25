<template>
  <div>
    <div v-if="workProcessStepsLoading"> Loading... </div>
    <div v-else>
      <div v-if="workProcessStepsLoadingError">
        error: {{workProcessStepsLoadingError}}
      </div>
      <v-gantt-chart v-else ref="trace" :startTime="startTime" :endTime="endTime" :datas="ganttDatas" :scale="1440">
        <template v-slot:title>
          <span>Timeline</span>
        </template>
        <template v-slot:left="{data}">
          <div :class="'state-category-stack-'+data.category">{{data.name}}</div>
        </template>
        <template v-slot:block="{data,item}">
          <el-popover placement="top-start" title="Step" width="300" trigger="hover">
            <div>
              <span v-if="item.endTime">{{ item.beginTime |formatDateTimeMin}} - {{ item.endTime | formatDateTimeMin }}</span>
              <span v-else>{{ item.beginTime |formatDateTimeMin}} - now</span>
            </div>
            <div slot="reference" style="white-space: nowrap;" :class="'state-category-theme-dark-'+item.stateCategory" v-if="data && item">
              {{formatTimeDuration(item.beginTime, item.endTime)}}
            </div>
          </el-popover>
        </template>
      </v-gantt-chart>
    </div>
  </div>
</template>

<script>
import { client } from '../../flywheel'
import Moment from 'moment'
import _ from 'lodash'
import { formatTime, formatTimeDuration } from '../../times'

export default {
  name: 'WorkTimeline',
  props: {
    work: null
  },
  data () {
    return {
      workProcessSteps: [],
      processTraceTableData: [],

      workProcessStepsLoading: false,
      workProcessStepsLoadingError: null,

      startTime: '2019-01-10 00:00:00',
      endTime: '2019-01-13 00:00:00',
      // scale: 1440,  // 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60, 120，180,240,360, 720, 1440
      ganttDatas: []
    }
  },
  mounted () {
    this.loadTimeline()
  },
  methods: {
    formatTime: formatTime,
    formatTimeDuration: formatTimeDuration,
    loadTimeline () {
      this.workProcessSteps = []
      this.processTraceTableData = []
      this.workProcessStepsLoading = false
      this.workProcessStepsLoadingError = null
      if (!this.work) {
        return
      }

      this.workProcessStepsLoading = true
      const vue = this
      client.queryWorkProcessSteps(this.work.id).then((resp) => {
        vue.workProcessSteps = resp.data
        let minTime = Moment()
        let maxTime = Moment()
        _.forEach(vue.workProcessSteps, step => {
          const stepStart = Moment(step.beginTime)
          step.start = stepStart.format('YYYY-MM-DD HH:mm:ss')
          let stepEnd = Moment()
          if (step.endTime) {
            stepEnd = Moment(step.endTime)
          } else if (step.stateCategory > 2) {
            stepEnd = stepStart
          }
          step.end = stepEnd.format('YYYY-MM-DD HH:mm:ss')

          if (stepStart < minTime) {
            minTime = stepStart
          }
          if (stepEnd > maxTime) {
            maxTime = stepEnd
          }
        })
        vue.startTime = minTime.add(-2, 'days').format('YYYY-MM-DD HH:mm:ss')
        vue.endTime = maxTime.add(2, 'days').format('YYYY-MM-DD HH:mm:ss')

        // map[stateName][]WorkProcessStep
        const stateStepsMap = _.groupBy(vue.workProcessSteps, s => s.stateName)

        return client.detailWorkflow(vue.work.flowId).then(detail => {
          _.forEach(detail.stateMachine.states, state => {
            state.gtArray = stateStepsMap[state.name]
          })
          vue.ganttDatas = detail.stateMachine.states
        })
      }).catch((error) => {
        vue.workProcessStepsLoadingError = 'failed to load work process details'
        vue.$notify.error({ title: 'Error', message: 'failed to load work process steps: ' + error })
      }).finally(() => {
        vue.workProcessStepsLoading = false
      })
    }
  }
}
</script>

<style scoped>
</style>
