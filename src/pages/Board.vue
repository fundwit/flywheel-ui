<template>
  <div>
    <div class="page-header">
      <div style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center; justify-content: space-between;">
        <div class="kanban-header-left">
          <div style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">
            <el-card class="kanban-info" :style="{'margin-right': '5px', 'border-radius': '0'}" :body-style="{ padding: '0px', margin: '5px' }" shadow="never">
              默认看板
            </el-card>

            <el-card class="kanban-actions" :style="{'margin-right': '5px', 'border-radius': '0'}" :body-style="{ padding: '0px', margin: '5px' }" shadow="never">
              <el-button type="primary" size="mini" @click="onCreateWorkDialog" icon="el-icon-circle-plus-outline">添加工作</el-button>
            </el-card>

            <el-card class="kanban-workflow-filters" :style="{'margin-right': '5px', 'border-radius': '0'}" :body-style="{ padding: '0px', margin: '5px' }" shadow="never">
              <el-checkbox-group v-model="workflowFilter" @change="onWorkflowFilterChanged">
                <el-checkbox v-for="(workflow, key) in workflowIndex" :label="workflow.id" :key="key">
                  <el-tag class="work-type-label" :style="{ backgroundColor: workflow.themeColor }" effect="dark">
                    <i :class="workflow.themeIcon"/> {{workflow.name}}
                  </el-tag>
                </el-checkbox>
              </el-checkbox-group>
            </el-card>
          </div>
        </div>
        <div class="kanban-header-right">
          <el-card class="kanban-stats" :style="{'margin-right': '5px', 'border-radius': '0', 'border-width': '0'}" :body-style="{ padding: '0px', margin: '5px' }" shadow="never">
            <span :style="{ backgroundColor: '#E1E1E0', 'font-size':'0.6rem' }">
              {{totalFilteredWorksCount}} work{{totalFilteredWorksCount > 1 ? 's': ''}}
            </span>
            <el-divider direction="vertical"/>
            <span v-for="(workflow, flowId) in workflowIndexFiltered" :key="flowId" :style="{ backgroundColor: workflow.themeColor, color:'white', 'font-size':'0.6rem' }">
              <i :class="workflow.themeIcon"/> {{workflow.workCount}}
            </span>
          </el-card>
        </div>
      </div>
    </div>
    <el-dialog v-if="showWorkCreatingDialog === true" title="Create Work" :visible="true" width="60%"
               :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
      <work-creating-form :selectedProjectId="$route.query.projectId" @action-result="onWorkCreatingResult"/>
    </el-dialog>

    <el-dialog v-if="workDetail" :show-close="false" :visible="true" :close-on-click-modal="true" width="80%" :before-close="onCloseDetail"
      class="fw-dialog">
      <work-detail :work-id="workDetail.id" @workDeleted="onWorkDeleted" @workUpdated="onWorkUpdated"
       @workContributionChanged="onWorkContributionChanged"/>
    </el-dialog>

    <div style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: stretch; width: 100%; overflow: auto">
      <div style="padding: 6px 12px">
        <member-stats :project-id="this.$route.query.projectId" :workContributions="workContributions"/>
      </div>
      <div v-for="state in mergedStates" :key="state.category + '-' + state.name">
        <div :id="'col-'+state.name" :class="computeStateHeaderClass(state)" :style="computeStateCategoryHeaderStyle(state)" role="group" :aria-label="state.name"
             style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: stretch; overflow: auto">
          <span style="flex-grow: 1">
            <i :class="categoryStyle(state.category).themeIcon"/>
            {{state.name}}
            <span v-for="stat in state.stats" :key="stat.workflowId" :style="{ backgroundColor: workflowIndex[stat.workflowId].themeColor, color:'white', 'font-size':'0.6rem' }">
              <i :class="workflowIndex[stat.workflowId].themeIcon"/> {{stat.count}}/{{stat.capacity}}
            </span>
          </span>

          <el-dropdown v-if="state.category === 3 || state.category === 4" size="small">
            <span class="el-dropdown-link">
               <i class="el-icon-more"/>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-setting"  @click.native="handleClick">Settings</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <draggable :id="'stack-'+state.name" :data-state="state.name" :data-state-category="state.category" handle=".drag-handler"
                   :class="computeStateStackClass(state)" :style="computeStateCategoryStackStyle(state)" class="hide-scroll-bar"
                   :group="state.canTransitionTo ? 'enable-drag' : 'disable-drag'" v-model="groupedWorks[state.category + '-' + state.name]" draggable=".item"
                   animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass" @start="onStart" @end="onEnd">
          <work-card v-for="work in groupedWorks[state.category + '-' + state.name]" :key="work.name"
                     :work="work" :workflow="workflowIndex[work.flowId]" :contributions="workContributions[work.identifier]"
                     @titleClicked="onWorkDetail" @workArchived="onWorkArchived" @workContributionChanged="onWorkContributionChanged"
                     :data-id="work.id" :data-state="work.stateName"/>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import client from '../flywheel'
import _ from 'lodash'
import computeOrderChanges from '../orders'
import { formatTime, formatTimeDuration } from '../times'
import WorkDetail from '../components/WorkDetail'
import WorkCreatingForm from '../components/work/WorkCreatingForm'
import WorkCard from '../components/work/WorkCard'
import MemberStats from '../components/kanban/MemberStats'
import { categoryStyle } from '../themes'

export default {
  components: {
    draggable,
    WorkDetail,
    WorkCreatingForm,
    WorkCard,
    MemberStats
  },
  data () {
    return {
      showWorkCreatingDialog: false,

      workflowFilter: null,

      draggedWork: null,
      groupedWorks: {},
      workContributions: {},
      mergedStates: [],
      workflowIndex: {},
      totalFilteredWorksCount: 0,
      conHeight: {
        height: '',
        'overflow-y': 'auto'
      },
      // drawer: false,
      workDetail: null
    }
  },
  computed: {
    workflowIndexFiltered () {
      return _.filter(this.workflowIndex, (workflow, workflowId) => _.includes(this.workflowFilter, workflowId))
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
        this.workflowFilter = null
        this.loadBoardData()
      },
      deep: true
    }
  },
  methods: {
    formatTime: formatTime,
    formatTimeDuration: formatTimeDuration,
    categoryStyle: categoryStyle,
    clear () {
      this.draggedWork = null
      this.groupedWorks = {}
      this.mergedStates = []
      this.workflowIndex = {}
      this.workContributions = {}
      this.totalFilteredWorksCount = 0
    },
    loadBoardData () {
      this.clear()

      const projectId = this.$route.query.projectId
      if (!projectId) {
        return
      }

      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      this.loadWorksAndStates(projectId).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    computeHeight () {
      this.conHeight.height = window.innerHeight - 220 + 'px'
    },
    computeStateCategoryHeaderStyle (state) {
      return categoryStyle(state.category).backgroundStyle
    },
    computeStateCategoryStackStyle (state) {
      return _.assign(categoryStyle(state.category).backgroundStyle, this.conHeight)
    },
    computeStateHeaderClass (state) {
      return { 'state-header': true }
    },
    computeStateStackClass (state) {
      return {
        'state-stack': true,
        'state-valid': state.canTransitionTo === true,
        'state-invalid': state.canTransitionTo === false
      }
    },
    loadWorksAndStates (projectId) {
      const vue = this
      return client.queryWorks(projectId).then((resp) => {
        const queriedGroupedWorks = _.groupBy(resp.data, (v) => v.stateCategory + '-' + v.stateName)
        const workflowIds = {}
        _.forEach(resp.data, v => {
          workflowIds[v.flowId] = v.flowId
        })

        const workflowRequest = []
        _.forEach(workflowIds, key => {
          workflowRequest.push(client.detailWorkflow(key))
        })

        Promise.all(workflowRequest).then(workflowList => {
          if (vue.workflowFilter === null) {
            const workflowFilter = []
            _.forEach(workflowList, workflow => {
              workflowFilter.push(workflow.id)
            })
            vue.workflowFilter = workflowFilter
          }

          const mergedStates = []
          const workflowIndex = {}
          const tmpMergedStatesIndex = {}
          _.forEach(workflowList, workflow => {
            workflow.workCount = _.filter(resp.data, w => w.flowId === workflow.id).length
            workflowIndex[workflow.id] = workflow
            if (_.includes(vue.workflowFilter, workflow.id)) {
              _.forEach(workflow.stateMachine.states, state => {
                const count = _.filter(resp.data, work => work.flowId === workflow.id && work.stateName === state.name).length
                const mergedState = tmpMergedStatesIndex[state.category + '-' + state.name]
                if (!mergedState) {
                  const newAggregatedState = { name: state.name, category: state.category, order: state.order, stats: [{ workflowId: workflow.id, count: count, capacity: '∞' }] }
                  tmpMergedStatesIndex[state.category + '-' + state.name] = newAggregatedState
                  mergedStates.push(newAggregatedState)
                } else {
                  mergedState.order = _.max([mergedState.order, state.order])
                  mergedState.stats.push({ workflowId: workflow.id, count: count, capacity: '∞' })
                }
              })
            }
          })
          vue.workflowIndex = workflowIndex
          vue.mergedStates = _.orderBy(mergedStates, ['category', 'order'], ['asc', 'asc'])
          // initialize state arrays
          _.forEach(vue.mergedStates, (state) => {
            vue.$set(vue.groupedWorks, state.category + '-' + state.name, [])
          })
          // apply workflow filter
          _.forEach(queriedGroupedWorks, (stateWorks, stateKey) => {
            const filteredWorks = _.filter(stateWorks, w => _.includes(vue.workflowFilter, w.flowId))
            vue.$set(vue.groupedWorks, stateKey, filteredWorks)
            vue.totalFilteredWorksCount += filteredWorks.length
          })
        }).then(() => {
          this.loadWorkContributors()
        })
      })
    },
    loadWorkContributors () {
      const vue = this
      const workKeys = []

      _.forEach(this.groupedWorks, (stateWorks) => {
        _.forEach(stateWorks, (work) => {
          workKeys.push(work.identifier)
        })
      })
      if (!workKeys.length) {
        this.workContributions = {}
        return
      }

      const userStatsIndex = {}
      const workAggregateIndex = {}
      client.queryContributions({ workKeys: workKeys }).then(data => {
        _.forEach(data, (c) => {
          if (!c.effective) {
            return
          }

          // group by work
          let workAggregate = workAggregateIndex[c.workKey]
          if (!workAggregate) {
            workAggregate = []
            workAggregateIndex[c.workKey] = workAggregate
          }
          workAggregate.push(c)

          // group by user
          let userStats = userStatsIndex[c.contributorId]
          if (!userStats) {
            userStats = []
            userStatsIndex[c.contributorId] = userStats
          }
          userStats.push(c)
        })

        _.forEach(workAggregateIndex, (contributions, workKey) => {
          vue.$set(vue.workContributions, workKey, contributions)
        })
      })
    },

    onStart (event) {
      const fromState = event.from.getAttribute('data-state')
      const fromStateCategory = event.from.getAttribute('data-state-category')
      this.draggedWork = this.groupedWorks[fromStateCategory + '-' + fromState][event.oldIndex]
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.loadAvailableTransitions(this.draggedWork.flowId, fromState).then(r => {
        const workflowStates = {}
        _.forEach(vue.workflowIndex[vue.draggedWork.flowId].stateMachine.states, state => {
          workflowStates[state.name] = state
        })
        const availableStates = _.flatMap(r, transition => {
          return workflowStates[transition.to]
        })
        availableStates.push(workflowStates[fromState])
        _.forEach(vue.mergedStates, (state, idx) => {
          if (_.find(availableStates, availableState => availableState.name === state.name && availableState.category === state.category)) {
            state.canTransitionTo = true
            vue.$set(vue.mergedStates, idx, state)
          } else {
            state.canTransitionTo = false
            vue.$set(vue.mergedStates, idx, state)
          }
        })
      }).catch(error => {
        this.$notify.error({ title: 'Error', message: '未查询到可移动到的状态' + error })
      }).finally(() => {
        mask.close()
      })
    },
    updateOrders (stateCategory, stateName, newIndex, oldIndex) {
      const works = this.groupedWorks[stateCategory + '-' + stateName]
      if (works.length <= 1) {
        return Promise.resolve()
      }

      // compute orders
      const workOrders = _.map(works, (work, index) => {
        return { index: index, id: work.id, orderInState: work.orderInState }
      })
      const changes = computeOrderChanges(workOrders, 'id', 'orderInState', newIndex, oldIndex)
      if (!changes || changes.length === 0) {
        return Promise.resolve()
      }

      const vue = this
      return client.updateStateRangeOrders(changes).then(() => {
        _.forEach(changes, change => {
          works[change.index].orderInState = change.newOrder
        })
        vue.$set(vue.groupedWorks, stateCategory + '-' + stateName, works)
      }).catch(error => {
        this.$notify.error({ title: 'Error', message: 'failed to update index:' + error })
      })
    },
    onEnd (event) {
      const mask = this.$loading({ lock: true, text: 'Processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      const vue = this
      // remove dynamic class
      _.forEach(vue.mergedStates, (state, idx) => {
        delete state.canTransitionTo
        vue.$set(vue.mergedStates, idx, state)
      })
      const fromState = event.from.getAttribute('data-state')
      const fromStateCategory = event.from.getAttribute('data-state-category')
      const toState = event.to.getAttribute('data-state')
      const toStateCategory = event.to.getAttribute('data-state-category')
      const workId = event.item.getAttribute('data-id')
      const flowId = this.draggedWork.flowId

      if (fromState === toState) {
        this.updateOrders(toStateCategory, toState, event.newIndex, event.oldIndex).finally(() => {
          this.draggedWork = null
          mask.close()
        })
      } else {
        client.createWorkTransition(flowId, workId, fromState, toState).then(body => {
          this.draggedWork.stateName = toState
          vue.$set(vue.groupedWorks, toStateCategory + '-' + toState, vue.groupedWorks[toStateCategory + '-' + toState])
          return this.updateOrders(toStateCategory, toState, event.newIndex, 9007199254740990)
        }).catch(error => {
          vue.groupedWorks[toStateCategory + '-' + toState].splice(event.newIndex, 1)
          vue.groupedWorks[fromStateCategory + '-' + fromState].splice(event.oldIndex, 0, this.draggedWork)
          vue.$set(vue.groupedWorks, toStateCategory + '-' + toState, vue.groupedWorks[toState])
          vue.$set(vue.groupedWorks, fromStateCategory + '-' + fromState, vue.groupedWorks[fromState])

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
    onWorkArchived (archivedWork) {
      if (archivedWork) {
        this.loadBoardData()
      }
    },
    onCloseDetail () {
      // this.drawer = false
      this.workDetail = null
    },
    onWorkDeleted (val) {
      if (val) {
        this.onCloseDetail()
        this.loadBoardData()
      }
    },
    onWorkUpdated (updatedWork) {
      if (updatedWork) {
        const key = updatedWork.stateCategory + '-' + updatedWork.stateName
        const works = this.groupedWorks[key]
        const oldWorkIndex = _.findIndex(works, w => w.id === updatedWork.id)
        if (oldWorkIndex >= 0) {
          const mergedWork = _.extend(works[oldWorkIndex], updatedWork)
          works.splice(oldWorkIndex, 1, mergedWork)
          this.$set(this.groupedWorks, key, works)
        } else {
          console.log(`work ${updatedWork.id} not found in ${key} group`)
        }
      }
    },
    onWorkContributionChanged () {
      this.loadWorkContributors()
    },
    onCreateWorkDialog () {
      this.showWorkCreatingDialog = true
    },
    onWorkCreatingResult (work) {
      this.showWorkCreatingDialog = false
      if (work) {
        delete work.state
        delete work.type
        this.loadBoardData()
      }
    },
    onWorkflowFilterChanged (value) {
      this.loadBoardData()
    },
    handleClick () {
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
  .work-type-label {
    line-height: 20px;
    height: 24px;
    padding: 0 5px;
    margin-right: 5px;
  }
.el-dropdown-link{
  cursor: pointer;
}
  .state-valid {
    background-color: #d6fdd6 !important;
  }
  .state-invalid {
    background-color: #f8d6dc !important;
  }
  .state-header {
    margin: 0.5em;
    padding: 10px;
  }
  .state-stack {
    margin: 0.5em;
    padding: 10px;
    width: 300px;
  }

  /*.hide-scroll-bar::-webkit-scrollbar {*/
  /*  display: none;*/
  /*}*/
  .hide-scroll-bar::-webkit-scrollbar {
    /*滚动条整体样式*/
    width : 2px;
    height: 1px;
  }
  .hide-scroll-bar::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    background: dodgerblue;
  }
  .hide-scroll-bar::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    background: transparent;
  }
</style>
