<template>
    <div>
      <div v-if="!work">
        invalid id '{{workId}}'
      </div>

      <div v-if="work" id="work-detail">
        <div id="work-detail-header" style="background-color: #fde402; border-bottom: lightgray solid 0px; display: flex; display: -webkit-flex; flex-wrap: nowrap;">
          <div style="display: none; background-color: transparent; padding: 10px;"></div>
          <div style="display: none; width: 0; height: 0; border-width: 20px; border-style: solid; border-color: transparent transparent transparent red;"></div>
          <div style="padding: 10px"><i class="el-icon-magic-stick"/> #{{work.id}} {{work.name}}</div>
        </div>

        <div id="work-detail-body">
          <div id="state-area" style="padding: 10px;">
            {{work.type.name}}  | Current State: {{work.stateName}} <span v-if="work.state.category !== 2">({{formatTimeDuration(work.stateBeginTime, null)}})</span>
            |
            Existed: ({{ formatTime(work.createTime) }}) {{work.createTime}}
            |
            Processed {{work.processBeginTime}} - {{work.processEndTime}} ({{formatTimeDuration(work.processBeginTime, work.processEndTime)}})
          </div>

          <div id="trace-area" style="padding: 10px;">
            <div v-if="workProcessStepsLoading"> Loading... </div>
            <div v-if="!workProcessStepsLoading">
              <div v-if="workProcessStepsLoadingError">
                error:  {{workProcessStepsLoadingError}}
              </div>
              <div v-if="workProcessSteps">
                <div v-for="step in workProcessSteps" :key="step.workId + '-' + step.beginTime">
                  {{step.stateName}} ({{step.stateCategory}}): {{step.beginTime}} - {{step.endTime}}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
</template>

<script>
import client from '../flywheel'
import { formatTime, formatTimeDuration } from '../times'

export default {
  name: 'WorkDetail',
  props: {
    workId: null
  },
  data () {
    return {
      work: null,
      workProcessSteps: [],
      workProcessStepsLoading: false,
      workProcessStepsLoadingError: null
    }
  },
  methods: {
    formatTime: formatTime,
    formatTimeDuration: formatTimeDuration
  },
  watch: {
    work (val) {
      this.workProcessSteps = []
      this.workProcessStepsLoading = false
      this.workProcessStepsLoadingError = null

      if (!val) {
        return
      }

      const vue = this
      this.workProcessStepsLoading = true
      client.queryWorkProcessSteps(this.workId).then((resp) => {
        vue.workProcessSteps = resp.data
      }).catch((error) => {
        this.workProcessStepsLoadingError = 'failed to load work process details'
        vue.$notify.error({ title: 'Error', message: 'failed to load work process steps: ' + error })
      }).finally(() => {
        this.workProcessStepsLoading = false
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

</style>
