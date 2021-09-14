<template>
    <div>
      <div v-if="!work">
        invalid work id '{{workId}}'
      </div>

      <div v-if="work" id="work-detail">
        <div id="work-detail-actions" style="margin-bottom: 10px">
          <work-delete :work="work" @workDeleted="onWorkDeleted"/>
        </div>

        <el-divider/>

        <div id="work-detail-header" style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: stretch">
          <div style="padding: 10px; font-size: 1.0rem">
            <el-tag v-if="workflow" size="small" :style="{ backgroundColor: workflow.themeColor }" effect="dark">
              <i :class="workflow.themeIcon ? workflow.themeIcon : 'el-icon-s-claim'"/>
              {{workflow.name}}
            </el-tag>
            <span> {{ work.identifier }} </span>
          </div>

          <div style="flex-grow: 1; padding: 10px; font-size: 1.0rem">
            <span v-if="!isNameEditing"> {{work.name}}</span>
            <el-input v-if="isNameEditing" size="mini" style="width: 100%" v-model="editingName"/>
          </div>

          <div style="padding: 10px; font-size: 1.0rem">
            <span v-if="!isNameEditing">
              <el-button @click="onEditNameStarted" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
            </span>

            <span v-if="isNameEditing">
              <el-button @click="onEditNameSubmitted" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-check" type="success" size="mini"></el-button>
              <el-button @click="onEditNameCanceled" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-close" type="warning" size="mini"></el-button>
            </span>
          </div>
        </div>

        <el-divider/>
        <div id="work-detail-label" style="padding: 10px;">
          Label:
          <el-tag v-for="label in workLabels" :key="label.name" closable
            :style="{ backgroundColor: label.themeColor }" effect="dark" class="work-type-label"
            @close="onDeleteWorkLabel(label)">
            {{label.name}}
          </el-tag>
          <label-selector @labelSelected="onLabelSelected" :projectId="this.work.projectId" :labelFilters="workLabels"/>
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

          <el-divider/>
          <div id="checklist-area" style="padding: 10px;">
            <checklist-indicator :checklist="work.checklist"/>
            <checkitem-list :work="work" @checkItemsUpdated="onCheckitemsUpdated"/>
          </div>

          <div id="property-area" style="padding: 10px;">
          </div>

          <el-divider/>

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
import CheckitemList from './checklist/checklist.vue'
import LabelSelector from './label/label-selector.vue'
import ChecklistIndicator from './checklist/checklist-indicator.vue'

export default {
  name: 'WorkDetail',
  props: {
    workId: null
  },
  components: {
    WorkDelete,
    LabelSelector,
    CheckitemList,
    ChecklistIndicator
  },
  data () {
    return {
      work: null,
      workflow: null,
      workProcessSteps: [],
      processTraceTableData: [],
      processTraceTableHeaders: [],
      workProcessStepsLoading: false,
      workProcessStepsLoadingError: null,
      workLabels: [],

      isNameEditing: false,
      editingName: ''
    }
  },
  methods: {
    formatTime: formatTime,
    formatTimeDuration: formatTimeDuration,
    onWorkDeleted (deletedWork) {
      this.$emit('workDeleted', deletedWork)
    },
    onEditNameStarted () {
      this.editingName = this.work.name
      this.isNameEditing = true
    },
    onEditNameSubmitted () {
      if (this.editingName === this.work.name) {
        this.$notify.warning({ title: 'Warning', message: 'no changes' })
        this.abortEditing()
        return
      }

      if (this.editingName.trim().length === 0) {
        this.$notify.warning({ title: 'Warning', message: 'work name must not be empty' })
        return
      }

      const vue = this
      const changes = { name: this.editingName }
      client.updateWork(this.work.id, changes).then(data => {
        vue.work = _.assignIn(vue.work, data)
        vue.abortEditing()
        vue.$emit('workUpdated', vue.work)
      }).catch(error => {
        vue.$notify.error({ title: 'Error', message: '更新失败' + error })
      })
    },
    onEditNameCanceled () {
      this.abortEditing()
    },
    abortEditing () {
      this.editingName = ''
      this.isNameEditing = false
    },
    onLabelSelected (label) {
      if (!label || !label.id) {
        return
      }
      client.addWorkLabelRelation(this.work.id, label.id).then(resp => {
        this.workLabels.push(label)
        this.work.labels = this.workLabels
        this.$emit('workUpdated', this.work)
      }).catch(err => {
        this.$notify.error({ title: 'Error', message: 'request failed' + err })
      })
    },
    onDeleteWorkLabel (label) {
      if (!label || !label.id) {
        return
      }

      client.deleteWorkLabelRelation(this.work.id, label.id).then(resp => {
        this.workLabels = _.filter(this.workLabels, l => l.id !== label.id)
        this.work.labels = this.workLabels
        this.$emit('workUpdated', this.work)
      }).catch(err => {
        this.$notify.error({ title: 'Error', message: 'request failed' + err })
      })
    },
    onCheckitemsUpdated (checkitems) {
      this.$set(this.work, 'checklist', checkitems)
      this.$emit('workUpdated', this.work)
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
        return client.detailWorkflow(val.flowId).then(detail => {
          _.forEach(detail.stateMachine.states, rowData => {
            const stepsInState = _.filter(vue.processTraceTableHeaders, h => h.state === rowData.name)
            _.forEach(stepsInState, step => {
              rowData[step.timeRange] = step.timeRange
              if (step.isCurrentStep === true) {
                rowData.currentStepTimeRange = step.timeRange
              }
            })
          })
          vue.processTraceTableData = detail.stateMachine.states
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
      vue.workLabels = resp.labels
      this.$emit('workLoaded', vue.work)
      return client.detailWorkflow(vue.work.flowId)
    }).then(resp => {
      vue.workflow = resp
    }).catch((error) => {
      vue.$notify.error({ title: 'Error', message: 'failed to load work and workflow: ' + error })
    }).finally(() => {
      mask.close()
    })
  }
}
</script>

<style scoped>
.el-divider {
  margin: 5px 0 !important;
}
.property-row {
  padding-top: 10px;
  padding-right: 10px;
}
.property-title {
  font-weight: bold;
}
.work-type-label {
  line-height: 20px;
  height: 24px;
  padding: 0 5px;
  margin-right: 5px;
}
.state-category-stack-1 {
  background-color: #daf3f8;
}
.state-category-stack-2 {
  background-color: #fcf7cd;
}
.state-category-stack-3 {
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
