<template>
  <div class="hello">
    {{works ? works.length : 0}}
    <el-table :data="works" style="width: 100%">
      <el-table-column width="80px">
        <template slot-scope="scope">
          <el-tag size="small" :style="{ backgroundColor: workflowIndex[scope.row.flowId].themeColor }" effect="dark">
            <i :class="workflowIndex[scope.row.flowId].themeIcon ? workflowIndex[scope.row.flowId].themeIcon : 'el-icon-s-claim'"/>
            {{workflowIndex[scope.row.flowId].name}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="identifier" label="标识" width="80px">
        <template slot-scope="scope">
          <router-link :to="{ name: 'WorkDetail', params: { id: scope.row.id }}">{{ scope.row.identifier }}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称">
        <template slot-scope="scope">
          <span class="circle" v-if="scope.row.archivedTime">档</span>
          <span v-if="!scope.row.isEditing">
            <router-link :to="{ name: 'WorkDetail', params: { id: scope.row.id }}">{{ scope.row.name }}</router-link>
            <br/>
            <el-tag v-for="label in scope.row.labels" :key="label.name"
            :style="{ backgroundColor: label.themeColor }" effect="dark" class="work-type-label-small">
            {{label.name}}
          </el-tag>
          </span>
          <el-input v-if="scope.row.isEditing" v-model="editingWork.name" placeholder="请输入内容"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="stateName" label="状态" width="120px">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
      </el-table-column>
      <el-table-column prop="action" label="操作" width="180px">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.isEditing" @click="onEditWork(scope)" type="text" size="small">编辑</el-button>
          <el-button v-if="scope.row.isEditing" @click="onSaveEdit(scope)" type="text" size="small">保存</el-button>
          <el-button v-if="scope.row.isEditing" @click="onAbortEdit(scope)" type="text" size="small">取消</el-button>
          <work-delete v-if="!scope.row.isEditing" :work="scope.row" @workDeleted="onWorkDeleted"/>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import client from '../flywheel'
import _ from 'lodash'
import WorkDelete from './work/WorkDelete'

export default {
  name: 'WorkList',
  props: {
    works: null,
    workflowIndex: null
  },
  components: {
    WorkDelete
  },
  data () {
    return {
      editingWork: null
    }
  },
  methods: {
    onEditWork (scope) {
      this.editingWork = _.cloneDeep(scope.row)
      scope.row.isEditing = true
      this.$set(this.works, scope.$index, scope.row)
    },
    onSaveEdit (scope) {
      // compute differences between changes with origin
      const changes = {}
      _.forOwn(this.editingWork, (value, key) => {
        if (value !== scope.row[key]) {
          changes[key] = value
        }
      })
      // return if no changes
      if (_.keys(changes).length === 0) {
        this.abortEdit(scope, scope.row)
        this.$notify.warning({ title: 'Warning', message: 'no changes' })
        return
      }
      client.updateWork(scope.row.id, changes).then(data => {
        this.abortEdit(scope, this.editingWork)
        this.$emit('workUpdated', data)
      }).catch(error => {
        this.$notify.error({ title: 'Error', message: '更新失败' + error })
      })
    },
    onAbortEdit (scope) {
      this.abortEdit(scope, scope.row)
    },
    abortEdit (scope, updateTo) {
      this.editingWork = null
      delete scope.row.isEditing
      this.$set(this.works, scope.$index, updateTo)
    },
    onWorkDeleted (val) {
      this.$emit('workDeleted', val)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.work-type-label {
  line-height: 20px;
  height: 24px;
  padding: 0 5px;
  margin-right: 5px;
}
.work-type-label-small {
  display: inline;
  margin-right: 5px;
}
.circle {
  border: 1.5px solid #1E90FF;
  color: #1E90FF;
  font-size: 16px;
  border-radius: 100%;
  position: relative;
  z-index: 2;
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 28px;
  background-color: #FFF;
  text-align: center;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
}
</style>
