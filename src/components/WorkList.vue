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
      <el-table-column
        prop="name"
        label="名称">
      </el-table-column>
      <el-table-column
        prop="stateName"
        label="状态">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180">
      </el-table-column>
      <el-table-column
        prop="action" label="操作">
        <template slot-scope="scope">
          <el-button @click="onDeleteWork(scope.row)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import client from '../flywheel'

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
        this.$notify.error({
          title: 'Error',
          message: '数据加载失败' + error
        })
      }).finally(() => {
        mask.close()
      })
    },
    onCreateWork () {
      // trigger
      const mask = this.$loading({
        lock: true,
        text: 'Creating',
        spinner: 'el-icon-loading',
        background: 'rgba(255,255,255,0.7)'
      })
      client.createWork(this.creationForm).then((response) => {
        this.loadWorks()
      }).catch((error) => {
        debugger
        this.$notify.error({
          title: 'Error',
          message: '创建失败' + error
        })
      }).finally(() => {
        mask.close()
      })
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
          this.$notify.error({
            title: 'Error',
            message: '删除失败' + error
          })
        }).finally(() => {
          mask.close()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
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
