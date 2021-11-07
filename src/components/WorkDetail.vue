<template>
    <div>
      <div v-if="!work">
        invalid work id '{{workId}}'
      </div>

      <div v-if="work" id="work-detail" style="padding-top: 10px; background-color:white">

         <!-- identifier & title & actions -->
        <div id="work-identity-and-actions" class="fw-flex" style="background-color: #EEE;">
          <!-- identifier -->
          <div style="padding: 10px;">
            <el-tag v-if="workflow" size="small" :style="{ backgroundColor: workflow.themeColor }" effect="dark">
              <i :class="workflow.themeIcon ? workflow.themeIcon : 'el-icon-s-claim'"/>
              {{workflow.name}}
            </el-tag>
            <span> {{ work.identifier }} </span>
          </div>

          <!-- title -->
          <div class="fw-flex-grow fw-flex" style="padding: 10px;">
            <div class="fw-flex-grow">
              <span v-if="!isNameEditing"> {{work.name}}</span>
              <el-input v-if="isNameEditing" size="mini" style="width: 100%" v-model="editingName"/>
            </div>

            <div>
              <span v-if="!isNameEditing">
                <el-button @click="onEditNameStarted" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-edit-outline" type="primary" size="small"></el-button>
              </span>

              <span v-if="isNameEditing">
                <el-button @click="onEditNameSubmitted" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-check" type="success" size="mini"></el-button>
                <el-button @click="onEditNameCanceled" style="margin-left: 5px; padding: 5px 8px" icon="el-icon-close" type="warning" size="mini"></el-button>
              </span>
            </div>
          </div>

          <!-- actions -->
          <el-dropdown :hide-on-click="false">
            <div style="padding-top: 10px">
               <i class="el-icon-more" style="padding: 5px 8px"/>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item><work-delete :work="work" @workDeleted="onWorkDeleted"/></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <!-- body-frame -->
        <div id="body-frame" style="width: 90%; margin: 5px auto; margin-bottom: 10px;">
          <!-- label -->
          <div id="work-detail-label" style="font-size: 0.8rem; margin-left: 90px">
            <el-tag v-for="label in workLabels" :key="label.name" closable
              :style="{ backgroundColor: label.themeColor }" effect="dark" class="work-type-label"
              @close="onDeleteWorkLabel(label)">
              {{label.name}}
            </el-tag>
            <label-selector @labelSelected="onLabelSelected" :projectId="this.work.projectId" :labelFilters="workLabels"/>
          </div>
          <el-divider/>

          <!-- time-stat -->
          <div id="time-stat" style="justify-content: space-between" class="fw-flex">
            <div id="status">
              <el-tag style="background-color: red; color: white;" class="work-type-label">{{work.stateName}}</el-tag>
            </div>

            <div v-if="work.state.category !== 3 && work.state.category !== 4" class="fw-flex">
              <div title="Duration in Current State" style="margin-right: 5px">
                <i class="el-icon-timer"/>
              </div>

              <div style="white-space:nowrap">
                <div title="Duration in Current State">
                  {{formatTimeDuration(work.stateBeginTime, null)}}
                  <span class="fw-text-comment"> spent on current state</span>
                </div>
                <div class="fw-text-comment">
                  <span title="State Begin Time">{{work.stateBeginTime | formatDateTimeMin}}</span>
                  <span> - Now</span>
                </div>
              </div>
            </div>

            <div class="fw-flex">
              <div title="Duration in Process" style="margin-right: 5px">
                <i class="el-icon-stopwatch"/>
              </div>
              <div style="white-space:nowrap">
                <div title="Duration in Process">
                  {{formatTimeDuration(work.processBeginTime, work.processEndTime)}}
                  <span class="fw-text-comment"> spent on all in-process states</span>
                </div>
                <div class="fw-text-comment">
                  <span title="Process Begin Time">{{work.processBeginTime | formatDateTimeMin}} - </span>
                  <span title="Process End Time" v-if="work.processEndTime">{{work.processEndTime | formatDateTimeMin}} </span>
                  <span v-else>Now</span>
                </div>
              </div>
            </div>

            <div class="fw-flex">
              <div title="Duration of Total Life" style="margin-right: 5px">
                <i class="el-icon-time"/>
              </div>
              <div style="white-space:nowrap">
                <div title="Duration of Total Life">
                  {{formatTimeDuration(work.createTime, work.processEndTime)}}
                  <span class="fw-text-comment"> spent on the work overall</span>
                </div>
                <div class="fw-text-comment">
                  <span title="Create Time">{{work.createTime | formatDateTimeMin}} - </span>
                  <span title="Process End Time" v-if="work.processEndTime">{{work.processEndTime | formatDateTimeMin}}</span>
                  <span v-else>Now</span>
                </div>
              </div>
            </div>
          </div> <!-- time-stat end -->

          <el-divider/>

          <el-row id="tasks-and-properties" :gutter="20">
             <el-col :span="6">
                <!-- property -->
                <div id="property-area" class="fw-flex-grow" style="padding: 10px;">
                  <property-value-list v-if="work" :work="work" :textareaIgnore="true"/>
                  <div v-else>work is invalid</div>
                </div>
             </el-col>
              <el-col :span="18">
                <!-- task -->
                <div id="checklist-area" class="fw-flex-grow" style="padding: 10px;">
                  <div class="fw-flex">
                    <checklist-indicator class="fw-flex-grow" :checklist="work.checklist"/>
                    <contribution :work="work" :contributions="contributions" @workContributionChanged="onWorkContributionChanged"/>
                  </div>

                  <checkitem-list :work="work" :contributions="contributions"
                    @workContributionChanged="onWorkContributionChanged" @checkItemsUpdated="onCheckitemsUpdated"/>
                </div>

                <!-- textarea property -->
                <div id="property-area" class="fw-flex-grow" style="padding: 10px;">
                  <property-value-list v-if="work" :work="work" :textareaOnly="true"/>
                  <div v-else>work is invalid</div>
                </div>
              </el-col>
          </el-row>

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
          </div> <!-- trace end -->
        </div> <!-- body-frame end -->
      </div> <!-- work-detail end -->
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
import PropertyValueList from './property-value/property-value-list.vue'
import Contribution from './contribution/contribution.vue'

export default {
  name: 'WorkDetail',
  props: {
    workId: null
  },
  components: {
    WorkDelete,
    LabelSelector,
    PropertyValueList,
    CheckitemList,
    ChecklistIndicator,
    Contribution
  },
  data () {
    return {
      work: null,
      workflow: null,

      contributions: [],
      contributionsLoading: false,
      contribuitonsLoadingError: null,

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
        if (!this.workLabels) {
          this.workLabels = []
        }
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
    },
    onWorkContributionChanged () {
      this.loadContributions()
      this.$emit('workContributionChanged', this.work)
    },
    loadContributions () {
      this.contributionsLoading = true
      client.queryContributions({ workKeys: [this.work.identifier] }).then(data => {
        this.contributions = _.filter(data, d => d.effective)
      }).catch((error) => {
        this.contribuitonsLoadingError = 'failed to load contributions'
        this.$notify.error({ title: 'Error', message: 'failed to load contributions: ' + error })
      }).finally(() => {
        this.contributionsLoading = false
      })
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

      this.loadContributions()
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
