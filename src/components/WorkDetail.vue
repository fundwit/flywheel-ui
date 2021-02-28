<template>
    <div>
      <div v-if="!work">
        invalid id '{{workId}}'
      </div>

      <div v-if="work" id="work-detail">
        <div id="work-detail-actions" style="margin-bottom: 10px">
          <work-delete :work="work" @workDeleted="onWorkDeleted"/>
        </div>

        <div id="work-detail-header" style="background-color: #fde402; border-bottom: lightgray solid 0px; display: flex; display: -webkit-flex; flex-wrap: nowrap;">
          <div style="display: none; background-color: transparent; padding: 10px;"></div>
          <div style="display: none; width: 0; height: 0; border-width: 20px; border-style: solid; border-color: transparent transparent transparent red;"></div>
          <div style="padding: 10px; font-size: 1.0rem"><i class="el-icon-magic-stick"/> #{{work.id}} {{work.name}}</div>
        </div>

        <div id="work-detail-body">
          <div id="state-area" style="padding: 10px;">
            <el-row class="property-row">
              <el-col :span="8">
                <span class="property-title">Type: </span>
                <span>{{work.type.name}}</span>
              </el-col>
              <el-col :span="8">
                <span class="property-title">Workflow: </span>
                <span>{{work.type.name}}</span>
              </el-col>
              <el-col :span="8">
                <span class="property-title">Current State: </span>
                <span>{{work.stateName}}</span>
                <span v-if="work.state.category !== 2">({{formatTimeDuration(work.stateBeginTime, null)}})</span>
              </el-col>
            </el-row>
            <el-row class="property-row">
              <el-col :span="24">
                <span class="property-title">Creation At: </span>
                <span>({{ formatTime(work.createTime) }}) {{work.createTime}}</span>
              </el-col>
            </el-row>
          </div>

          <div id="property-area" style="padding: 10px;">
          </div>

          <el-divider style="margin: 0"/>
          <div id="trace-area" style="padding: 10px;">
            <div>Process Progress</div>

            <el-row class="property-row" style="padding-bottom: 10px;">
              <el-col :span="24">
                <span class="property-title">Begin Process At: </span>
                <span>{{work.processBeginTime}} - {{work.processEndTime}} ({{formatTimeDuration(work.processBeginTime, work.processEndTime)}})</span>
              </el-col>
            </el-row>

            <div v-if="workProcessStepsLoading"> Loading... </div>
            <div v-if="!workProcessStepsLoading">
              <div v-if="workProcessStepsLoadingError">
                error:  {{workProcessStepsLoadingError}}
              </div>
              <div v-if="workProcessSteps">
                <el-table id="process-traces-table" :data="processTraceTableData" :show-header="false" style="width: 100%" :cell-style="{padding: 0}">
                  <el-table-column label="状态" width="180">
                    <template slot-scope="scope">
                      <div :class="'state-category-stack-' + scope.row.category">
                        <i class="el-icon-time"></i>
                        <span style="margin-left: 10px">{{ scope.row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column v-for="header in processTraceTableHeaders" label="" v-bind:key="header.timeRange">
                    <template slot-scope="scope">
                      <el-popover v-if="scope.row[header.timeRange]" trigger="hover" placement="top">
                        <p>{{ scope.row[header.timeRange] }}</p>
                        <div slot="reference" class="name-wrapper">
                          <div :class="'state-category-stack-' + scope.row.category">
                            <el-progress :status="scope.row.currentStepTimeRange === header.timeRange ? 'warning' : 'success'"
                                         :text-inside="true" stroke-linecap="square" :stroke-width="23" :show-text="false" :percentage="100"/>
                          </div>
                        </div>
                      </el-popover>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
</template>

<script>
import client from '../flywheel'
import _ from 'lodash'
import { formatTime, formatTimeDuration } from '../times'
import WorkDelete from './work/WorkDelete'

export default {
  name: 'WorkDetail',
  props: {
    workId: null
  },
  components: {
    WorkDelete
  },
  data () {
    return {
      work: null,
      workProcessSteps: [],
      processTraceTableData: [],
      processTraceTableHeaders: [],
      workProcessStepsLoading: false,
      workProcessStepsLoadingError: null
    }
  },
  methods: {
    formatTime: formatTime,
    formatTimeDuration: formatTimeDuration,
    onWorkDeleted (val) {
      this.$emit('workDeleted', val)
    }
  },
  watch: {
    work (val) {
      this.workProcessSteps = []
      this.processTraceTableData = []
      this.processTraceTableHeaders = []
      this.workProcessStepsLoading = false
      this.workProcessStepsLoadingError = null

      if (!val) {
        return
      }

      const vue = this
      this.workProcessStepsLoading = true
      client.queryWorkProcessSteps(this.workId).then((resp) => {
        const currentStep = _.find(resp.data, step => !step.endTime)
        if (currentStep) {
          currentStep.isCurrentStep = true
        }
        vue.workProcessSteps = resp.data

        vue.processTraceTableHeaders = _.map(vue.workProcessSteps, step => {
          return {
            timeRange: step.beginTime + '-' + (step.endTime ? step.endTime : ''),
            state: step.stateName,
            isCurrentStep: step.isCurrentStep === true
          }
        })
        return client.loadStates(val.flowId).then(states => {
          _.forEach(states, rowData => {
            const stepsInState = _.filter(vue.processTraceTableHeaders, h => h.state === rowData.name)
            _.forEach(stepsInState, step => {
              rowData[step.timeRange] = step.timeRange
              if (step.isCurrentStep === true) {
                rowData.currentStepTimeRange = step.timeRange
              }
            })
          })
          vue.processTraceTableData = states
        })
      }).catch((error) => {
        vue.workProcessStepsLoadingError = 'failed to load work process details'
        vue.$notify.error({ title: 'Error', message: 'failed to load work process steps: ' + error })
      }).finally(() => {
        vue.workProcessStepsLoading = false
      })
    }
  },
  mounted () {
    if (!this.workId) {
      this.work = null
      return
    }

    const vue = this
    const mask = this.$loading({ lock: true, text: 'requesting', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
    client.detailWork(this.workId).then((resp) => {
      vue.work = resp
    }).catch((error) => {
      vue.$notify.error({ title: 'Error', message: 'failed to load workflow: ' + error })
    }).finally(() => {
      mask.close()
    })
  }
}
</script>

<style scoped>
.property-row {
  padding-top: 10px;
  padding-right: 10px;
}
.property-title {
  font-weight: bold;
}

.state-category-stack-0 {
  background-color: #daf3f8;
}
.state-category-stack-1 {
  background-color: #fcf7cd;
}
.state-category-stack-2 {
  background-color: #e2e2e2;
}
.step-current {
  color: deepskyblue;
  font-weight: bold;
}
#process-traces-table .cell {
  padding: 0;
}
</style>
