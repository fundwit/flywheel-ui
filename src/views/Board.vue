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
            <div>{{ work.name }}</div>
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

export default {
  components: {
    draggable
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
  methods: {
    computeHeight () {
      this.conHeight.height = window.innerHeight - 200 + 'px'
    },
    loadWorkflow () {
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
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      const vue = this
      client.queryWork().then((resp) => {
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
      })
    },
    onEnd (event) {
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
        this.draggedWork = null
        return
      }

      client.createWorkTransition(flowId, workId, fromState, toState).then(body => {
        this.draggedWork.stateName = toState
      }).catch(error => {
        vue.groupedWorks[toState].splice(event.newIndex, 1)
        vue.groupedWorks[fromState].splice(event.oldIndex, 0, this.draggedWork)
        vue.$set(vue.groupedWorks, toState, vue.groupedWorks[toState])
        vue.$set(vue.groupedWorks, fromState, vue.groupedWorks[fromState])

        this.$notify.error({ title: 'Error', message: '未查询到可移动到的状态' + error })
      }).finally(() => {
        this.draggedWork = null
      })
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
    background-color: lightgreen;
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
</style>
