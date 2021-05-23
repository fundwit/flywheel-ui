<template>
  <div>
    <el-row>
      <el-col :span="3">
        <el-menu router>
          <el-menu-item index="/admin/metrics">
            <i class="el-icon-pie-chart"></i>
            <span slot="title">Metrics</span>
          </el-menu-item>
          <el-menu-item index="/admin/projects">
            <i class="el-icon-user"></i>
            <span slot="title">Projects</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <i class="el-icon-user"></i>
            <span slot="title">Users</span>
          </el-menu-item>
          <el-menu-item index="/admin/notifications">
            <i class="el-icon-message"></i>
            <span slot="title">Notifications</span>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="21">
        <router-view>Viewer</router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'AdminHome',
  components: {
  },
  data () {
    return {
    }
  }
}
</script>

<style scoped>
</style>
