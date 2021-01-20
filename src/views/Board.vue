<template>
  <div>
    <div class="page-header">个人看板 工作数量 支持的工作类型</div>
    <el-row>
      <el-col :span="8" v-for="state in states" :key="state.name">
        <div :id="'col-'+state.name" class="state-header" role="group" aria-label="Basic example">
          {{state.name}}
        </div>
        <draggable :id="'stack-'+state.name" :data-state="state.name" class="list-group" :class="{'state-valid': state.canTransitionTo}"
                   :style="conHeight"
                   :group="state.canTransitionTo ? 'enable-drag' : 'disable-drag'" v-model="groupedWorks[state.name]" draggable=".item"
                   animation="300" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass" @start="onStart" @end="onEnd">

          <div class="list-group-item item" :data-state="work.stateName" :data-id="work.id" v-for="work in groupedWorks[state.name]" :key="work.name">
            <el-row type="flex" justify="space-between">
              <el-col :span="20">
                <div>
                  <el-tag key="task" class="work-type-label" type="warning" effect="dark"><i class="el-icon-magic-stick"/>Task</el-tag>
                  <span>{{work.id}}</span>
                </div>
                <div class="work-card-title">
                  {{ work.name }}
                </div>
              </el-col>
              <el-col :span="3">
                <Avatar username="admin xx" :rounded="false"/>
              </el-col>
            </el-row>

            <div>{{ work.createTime }}</div>
          </div>
        </draggable>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import client from '../flywheel'
import _ from 'lodash'
import Avatar from 'vue-avatar'
import computeOrderChanges from '../orders'

export default {
  components: {
    draggable,
    Avatar
  },
  data () {
    return {
      draggedWork: null,
      groupedWorks: {},
      states: [],
      conHeight: {
        height: ''
      }
    }
  },
  created () {
    window.addEventListener('resize', this.computeHeight)
    this.computeHeight()
  },
  mounted () {
    this.loadWorkflow()
  },
  watch: {
    $route: {
      handler () {
        this.loadWorkflow()
      },
      deep: true
    }
  },
  methods: {
    clear () {
      this.draggedWork = null
      this.groupedWorks = {}
      this.states = []
    },
    computeHeight () {
      this.conHeight.height = window.innerHeight - 200 + 'px'
    },
    loadWorkflow () {
      this.clear()

      const groupId = this.$route.query.projectId
      if (!groupId) {
        return
      }

      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      const vue = this
      client.loadStates().then((resp) => {
        vue.states = resp
        _.forEach(vue.states, (state, idx) => {
          vue.$set(vue.groupedWorks, state.name, [])
        })
        mask.close()
        vue.loadWorks()
      }).catch((error) => {
        mask.close()
        this.$notify.error({ title: 'Error', message: 'failed to load workflow: ' + error })
      })
    },
    loadWorks () {
      const groupId = this.$route.query.projectId
      if (!groupId) {
        return
      }
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      const vue = this
      client.queryWork(groupId).then((resp) => {
        const groupedWorks = _.groupBy(resp.data, (v) => v.stateName)
        _.forEach(groupedWorks, (works, stateName) => {
          vue.$set(vue.groupedWorks, stateName, works)
        })
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onStart (event) {
      const fromState = event.from.getAttribute('data-state')
      this.draggedWork = this.groupedWorks[fromState][event.oldIndex]
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Processing', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.loadAvailableTransitions(fromState).then(r => {
        const availableStates = _.flatMap(r, transition => {
          return transition.to.name
        })
        availableStates.push(fromState)
        _.forEach(vue.states, (state, idx) => {
          if (_.includes(availableStates, state.name)) {
            state.canTransitionTo = true
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
        state.canTransitionTo = false
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
    }
  }
}
</script>
<style scoped>
  .page-header {
    padding: 10px;
    border-bottom: 1px solid #EEEEEE;
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
  .state-header {
    margin: 1em;
    padding: 10px;
    background-color: #F8F8F8;
  }
  .list-group {
    margin: 1em;
    padding: 10px;
    background-color: #F8F8F8;
  }
  .state-valid {
    background-color: #def8de;
  }
  .item{
    cursor: pointer;
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
</style>
