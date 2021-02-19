<template>
  <el-card class="box-card" style="width: 80%; margin: 1rem auto">
    <div>{{id}} {{workflow.name}}</div>
    <el-divider style="margin: 0"/>
    <div>state machine</div>

    <el-table v-if="workflow && workflow.stateMachine" :data="workflow.stateMachine.states" style="width: 100%">
      <el-table-column label="states" width="180">
        <template slot-scope="scope">
          <div :class="'state-category-stack-' + scope.row.category">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="transitions">
        <template slot-scope="scope">
          <el-table :data="statesTransition[scope.row.name]" :show-header="false" :cell-style="{padding: 0}">
            <el-table-column label="name" prop="name"></el-table-column>
            <el-table-column label="from" prop="from.name">
              <template slot-scope="scope1">
                <div :class="'state-category-stack-' + scope1.row.from.category">
                  <i class="el-icon-time"></i>
                  <span style="margin-left: 10px">{{ scope1.row.from.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column width="50px">
              <template> ==> </template>
            </el-table-column>
            <el-table-column label="to" prop="to.name">
              <template slot-scope="scope1">
                <div :class="'state-category-stack-' + scope1.row.to.category">
                  <i class="el-icon-time"></i>
                  <span style="margin-left: 10px">{{ scope1.row.to.name }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
    </el-table>

  </el-card>
</template>

<script>
import _ from 'lodash'
import client from '../flywheel'

export default {
  name: 'WorkflowDetail',
  data () {
    return {
      id: 0,
      workflow: null,
      statesTransition: {}
    }
  },
  mounted () {
    this.id = this.$route.params.id
    this.loadWorkflowDetail()
  },
  methods: {
    loadWorkflowDetail () {
      if (!this.id) {
        return
      }
      const vue = this
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      client.detailWorkflow(this.id).then((resp) => {
        vue.workflow = resp
        vue.statesTransition = _.groupBy(vue.workflow.stateMachine.transitions, transition => transition.from.name)
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    }
  }
}
</script>

<style scoped>
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
