<template>
  <div class="home">
    <WorkList/>
  </div>
</template>

<script>
import WorkList from '@/components/WorkList.vue'

export default {
  name: 'WorkBacklog',
  components: {
    WorkList
  },
  data () {
    return {
    }
  }
}
</script>
