<template>
  <div class="hello">
    <el-form :inline="true" :model="creationForm" class="demo-form-inline">
      <el-form-item label="Name">
        <el-input v-model="creationForm.name" placeholder="Work Name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onCreateWork">添加工作</el-button>
      </el-form-item>
    </el-form>

    {{total}}
    <el-table
      :data="works"
      style="width: 100%">
      <el-table-column prop="name" label="名称">
        <template slot-scope="scope">
          <span v-if="!scope.row.isEditing">{{ scope.row.name }}</span>
          <el-input v-if="scope.row.isEditing" v-model="editingWork.name" placeholder="请输入内容"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="stateName" label="状态">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
      </el-table-column>
      <el-table-column
        prop="action" label="操作">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.isEditing" @click="onEditWork(scope)" type="text" size="small">编辑</el-button>
          <el-button v-if="scope.row.isEditing" @click="onSaveEdit(scope)" type="text" size="small">保存</el-button>
          <el-button v-if="scope.row.isEditing" @click="onAbortEdit(scope)" type="text" size="small">取消</el-button>
          <el-button v-if="!scope.row.isEditing" @click="onDeleteWork(scope.row)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import client from '../flywheel'
import _ from 'lodash'

export default {
  name: 'WorkList',
  props: {
  },
  data () {
    return {
      creationForm: {
        name: '',
        group: 'default'
      },
      works: [],
      editingWork: null,
      total: 0
    }
  },
  mounted () {
    this.loadWorks()
  },
  methods: {
    loadWorks () {
      // mask
      const mask = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(255,255,255,0.7)'
      })
      const vue = this
      client.queryWork().then((resp) => {
        // vue.$set('works', response.data.data)
        vue.works = resp.data
        vue.total = resp.total
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '数据加载失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
    onCreateWork () {
      const mask = this.$loading({
        lock: true,
        text: 'Creating',
        spinner: 'el-icon-loading',
        background: 'rgba(255,255,255,0.7)'
      })
      client.createWork(this.creationForm).then((response) => {
        this.loadWorks()
      }).catch((error) => {
        this.$notify.error({ title: 'Error', message: '创建失败' + error })
      }).finally(() => {
        mask.close()
      })
    },
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
    onDeleteWork (row) {
      this.$confirm('此操作将永久删除工作: "' + row.name + '", 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const mask = this.$loading({
          lock: true,
          text: 'deleting',
          spinner: 'el-icon-loading',
          background: 'rgba(255,255,255,0.7)'
        })

        client.deleteWork(row.id).then((response) => {
          this.loadWorks()
        }).catch((error) => {
          this.$notify.error({ title: 'Error', message: '删除失败' + error })
        }).finally(() => {
          mask.close()
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
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
</style>
