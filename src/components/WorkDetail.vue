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
            <work-timeline :work="work"/>

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
import WorkTimeline from './work/work-timeline.vue'

export default {
  name: 'WorkDetail',
  props: {
    workId: null
  },
  components: {
    WorkDelete,
    WorkTimeline,
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

      const changes = { name: this.editingName }
      client.updateWork(this.work.id, changes).then(data => {
        this.work = _.assignIn(this.work, data)
        this.abortEditing()
        this.$emit('workUpdated', this.work)
      }).catch(error => {
        this.$notify.error({ title: 'Error', message: '更新失败' + error })
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
    work () {
      this.loadContributions()
    }
  },
  mounted () {
    if (!this.workId) {
      this.work = null
      return
    }

    const mask = this.$loading({ lock: true, text: 'requesting', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
    client.detailWork(this.workId).then((resp) => {
      this.work = resp
      this.workLabels = resp.labels
      this.$emit('workLoaded', this.work)
      return client.detailWorkflow(this.work.flowId)
    }).then(resp => {
      this.workflow = resp
    }).catch((error) => {
      this.$notify.error({ title: 'Error', message: 'failed to load work and workflow: ' + error })
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

.step-current {
  color: deepskyblue;
  font-weight: bold;
}
#process-traces-table .cell {
  padding: 0;
}
</style>
