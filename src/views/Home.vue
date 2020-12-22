<template>
  <div class="home">
    <WorkList msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import WorkList from '@/components/WorkList.vue'

export default {
  name: 'Home',
  components: {
    WorkList: WorkList
  }
}
</script>
