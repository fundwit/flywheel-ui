<template>
  <el-card style="width: 80%; margin: 20px auto 0 auto">
    <div v-if="!this.$route.params.id">work id is not specified</div>
    <work-detail v-if="this.$route.params.id" :work-id="this.$route.params.id" @workDeleted="onWorkDeleted" @workLoaded="onWorkLoaded"/>
  </el-card>
</template>

<script>
import WorkDetail from '../components/WorkDetail'
import statesConst from '../states/statesConst'
export default {
  name: 'WorkDetailPage',
  components: {
    WorkDetail
  },
  data () {
    return {
    }
  },
  mounted () {
    this.$store.commit(statesConst.currentProjectId, null)
  },
  methods: {
    onWorkDeleted (deletedWork) {
      if (deletedWork) {
        this.$router.push({ name: 'WorkBacklog', query: { projectId: deletedWork.projectId } })
      }
    },
    onWorkLoaded (work) {
      if (work) {
        this.$store.commit(statesConst.currentProjectId, work.projectId)
      }
    }
  }
}
</script>

<style scoped>

</style>
