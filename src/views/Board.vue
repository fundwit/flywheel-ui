<template>
  <div>
    <div class="page-header">个人看板 工作数量 支持的工作类型</div>

<!--    <el-drawer title="我是标题" :visible.sync="drawer" :destroy-on-close="true" :show-close="false" size="80%" :with-header="false" direction="rtl" :before-close="onCloseDetail">-->
<!--      <div>-->
<!--        <work-detail/>-->
<!--      </div>-->
<!--    </el-drawer>-->

    <el-dialog v-if="workDetail" :show-close="false"
      :visible="true"
      width="60%"
      :before-close="onCloseDetail">
      <work-detail :work-id="workDetail.id"/>
    </el-dialog>

    <div style="display: flex; display: -webkit-flex; flex-wrap: nowrap;">
      <div v-for="state in states" :key="state.name">
        <div :id="'col-'+state.name" :class="computeStateHeaderStyle(state)" role="group" :aria-label="state.name">
          <i class="el-icon-s-order" v-if="state.category === 0"/>
          <i class="el-icon-stopwatch" v-if="state.category === 1"/>
          <i class="el-icon-finished" v-if="state.category === 2"/>
          {{state.name}}
        </div>

        <draggable :id="'stack-'+state.name" :data-state="state.name" handle=".drag-handler"
                   :class="computeStateStackStyle(state)" :style="conHeight"
                   :group="state.canTransitionTo ? 'enable-drag' : 'disable-drag'" v-model="groupedWorks[state.name]" draggable=".item"
                   animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass" @start="onStart" @end="onEnd">
          <div class="list-group-item item" :data-state="work.stateName" :data-id="work.id" v-for="work in groupedWorks[state.name]" :key="work.name">
            <el-row type="flex" justify="space-between">
              <el-col :span="20">
                <div class="drag-handler">
                  <el-tag key="task" class="work-type-label" type="warning" effect="dark"><i class="el-icon-magic-stick"/>Task</el-tag>
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
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import client from '../flywheel'
import _ from 'lodash'
import Avatar from 'vue-avatar'
import computeOrderChanges from '../orders'
import { formatTime, formatTimeDuration } from '../times'
import WorkDetail from '../components/WorkDetail'

export default {
  components: {
    draggable,
    Avatar,
    WorkDetail
  },
  data () {
    return {
      draggedWork: null,
      groupedWorks: {},
      states: [],
      conHeight: {
        height: ''
      },
      // drawer: false,
      workDetail: null
    }
  },
  created () {
    window.addEventListener('resize', this.computeHeight)
    this.computeHeight()
  },
  mounted () {
    this.loadBoardData()
  },
  watch: {
    $route: {
      handler () {
        this.loadBoardData()
      },
      deep: true
    }
  },
  methods: {
    formatTime: formatTime,
    formatTimeDuration: formatTimeDuration,
    clear () {
      this.draggedWork = null
      this.groupedWorks = {}
      this.states = []
    },
    loadBoardData () {
      this.clear()

      const groupId = this.$route.query.projectId
      if (!groupId) {
        return
      }

      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      this.loadWorksAndStates(groupId).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    computeHeight () {
      this.conHeight.height = window.innerHeight - 200 + 'px'
    },
    computeStateHeaderStyle (state) {
      return {
        'state-header': true,
        ['state-category-header-' + state.category]: true,
        ['state-category-header-' + state.category]: true
      }
    },
    computeStateStackStyle (state) {
      return {
        'state-stack': true,
        ['state-category-stack-' + state.category]: true,
        ['state-category-stack-' + state.category]: true,
        'state-valid': state.canTransitionTo === true,
        'state-invalid': state.canTransitionTo === false
      }
    },
    loadWorksAndStates (groupId) {
      const vue = this
      return client.queryWork(groupId).then((resp) => {
        const groupedWorks = _.groupBy(resp.data, (v) => v.stateName)
        const workflowIds = {}
        _.forEach(resp.data, v => {
          workflowIds[v.flowId] = v.flowId
        })

        const workflowRequest = []
        _.forEach(workflowIds, key => {
          workflowRequest.push(client.loadStates(key))
        })

        Promise.all(workflowRequest).then((statesList) => {
          const aggregatedStates = []
          _.forEach(statesList, states => {
            _.forEach(states, state => {
              aggregatedStates.push(state)
            })
          })

          vue.states = aggregatedStates
          _.forEach(vue.states, (state) => {
            vue.$set(vue.groupedWorks, state.name, [])
          })
          _.forEach(groupedWorks, (works, stateName) => {
            vue.$set(vue.groupedWorks, stateName, works)
          })
        })
      })
    },

    onStart (event) {
      const fromState = event.from.getAttribute('data-state')
      this.draggedWork = this.groupedWorks[fromState][event.oldIndex]
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.loadAvailableTransitions(this.draggedWork.flowId, fromState).then(r => {
        const availableStates = _.flatMap(r, transition => {
          return transition.to.name
        })
        availableStates.push(fromState)
        _.forEach(vue.states, (state, idx) => {
          if (_.includes(availableStates, state.name)) {
            state.canTransitionTo = true
            vue.$set(vue.states, idx, state)
          } else {
            state.canTransitionTo = false
            vue.$set(vue.states, idx, state)
          }
        })
      }).catch(error => {
        this.$notify.error({ title: 'Error', message: '未查询到可移动到的状态' + error })
      }).finally(() => {
        mask.close()
      })
    },
    updateOrders (stateName, newIndex, oldIndex) {
      const works = this.groupedWorks[stateName]
      if (works.length <= 1) {
        return Promise.resolve()
      }

      // compute orders
      const workOrders = _.map(works, (work, index) => {
        return { index: index, id: work.id, orderInState: work.orderInState }
      })
      const changes = computeOrderChanges(workOrders, newIndex, oldIndex)
      if (!changes || changes.length === 0) {
        return Promise.resolve()
      }

      const vue = this
      return client.updateStateRangeOrders(changes).then(() => {
        _.forEach(changes, change => {
          works[change.index].orderInState = change.newOrder
        })
        vue.$set(vue.groupedWorks, stateName, works)
      }).catch(error => {
        this.$notify.error({ title: 'Error', message: 'failed to update index:' + error })
      })
    },
    onEnd (event) {
      const mask = this.$loading({ lock: true, text: 'Processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      const vue = this
      // remove dynamic class
      _.forEach(vue.states, (state, idx) => {
        delete state.canTransitionTo
        vue.$set(vue.states, idx, state)
      })
      const fromState = event.from.getAttribute('data-state')
      const toState = event.to.getAttribute('data-state')
      const workId = event.item.getAttribute('data-id')
      const flowId = this.draggedWork.flowId

      if (fromState === toState) {
        this.updateOrders(toState, event.newIndex, event.oldIndex).finally(() => {
          this.draggedWork = null
          mask.close()
        })
      } else {
        client.createWorkTransition(flowId, workId, fromState, toState).then(body => {
          this.draggedWork.stateName = toState
          vue.$set(vue.groupedWorks, toState, vue.groupedWorks[toState])
          return this.updateOrders(toState, event.newIndex, 9007199254740990)
        }).catch(error => {
          vue.groupedWorks[toState].splice(event.newIndex, 1)
          vue.groupedWorks[fromState].splice(event.oldIndex, 0, this.draggedWork)
          vue.$set(vue.groupedWorks, toState, vue.groupedWorks[toState])
          vue.$set(vue.groupedWorks, fromState, vue.groupedWorks[fromState])

          this.$notify.error({ title: 'Error', message: '未查询到可移动到的状态' + error })
        }).finally(() => {
          this.draggedWork = null
          mask.close()
        })
      }
    },
    onWorkDetail (work) {
      // this.drawer = true
      this.workDetail = work
    },
    onCloseDetail () {
      // this.drawer = false
      this.workDetail = null
    }
  }
}
</script>
<style scoped>
  .page-header {
    padding: 10px;
    border-bottom: 1px solid #EEEEEE;
  }
  .drag-handler {
    cursor: move;
  }
  .ghostClass{
    background-color:  blue !important;
  }
  .chosenClass{
    background-color: #fde402 !important;
    opacity: 1!important;
  }
  .dragClass{
    background-color: blueviolet !important;
    opacity: 1 !important;
    box-shadow:none !important;
    outline:none !important;
    background-image:none !important;
  }

  .item{
    padding: 12px;
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
  .work-type-label {
    line-height: 20px;
    height: 20px;
    padding: 0 5px;
    margin-right: 5px;
  }
  .work-card-title {
    padding: 10px 0;
    height: 3rem;
    word-wrap:break-word;
    word-break:break-all;
    overflow: hidden;
    line-height: 1.5rem;
    color: #929191;
  }

  .state-valid {
    background-color: #d6fdd6 !important;
  }
  .state-invalid {
    background-color: #f8d6dc !important;
  }
  .state-header {
    margin: 1em;
    padding: 10px;
  }
  .state-stack {
    margin: 1em;
    padding: 10px;
  }
  .state-category-header-0 {
    background-color: #daf3f8;
  }
  .state-category-header-1 {
    background-color: #fcf7cd;
  }
  .state-category-header-2 {
    background-color: #e2e2e2;
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
</style>
