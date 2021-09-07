<template>
  <div>
    <el-row>
      <el-col :span="3">
        <el-menu router>
          <el-menu-item :index="'/projects/'+$route.params.id+'/members'">
            <i class="el-icon-user"></i>
            <span slot="title">Members</span>
          </el-menu-item>
          <el-menu-item :index="'/projects/'+$route.params.id+'/labels'">
            <i class="el-icon-user"></i>
            <span slot="title">Labels</span>
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
  name: 'ProjectSettingsPage',
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
