<template>
  <el-card style="width: 80%; margin: 20px auto 0 auto">
    <div v-if="!this.$route.params.id">work id is not specified</div>
    <work-detail v-if="this.$route.params.id" :work-id="this.$route.params.id" @workDeleted="onWorkDeleted"/>
  </el-card>
</template>

<script>
import WorkDetail from '../components/WorkDetail'
export default {
  name: 'WorkDetailPage',
  components: {
    WorkDetail
  },
  data () {
    return {
    }
  },
  methods: {
    onWorkDeleted (deletedWork) {
      if (deletedWork) {
        this.$router.push({ name: 'WorkBacklog', query: { projectId: deletedWork.groupId } })
      }
    }
  }
}
</script>

<style scoped>

</style>
