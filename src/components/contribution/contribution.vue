<template>
    <div style="display: flex; display: -webkit-flex; flex-wrap: nowrap; align-items: center;">
      <contributor v-for="c in contributions" :key="c.id" :work="work" :contribution="c"
        @workContributionChanged="onWorkContributionChanged"/>

      <contributor-join v-if="work.stateCagetory != 3 && work.stateCagetory != 4"
       :work="work" :contributions="contributions" @workContributionChanged="onWorkContributionChanged"/>
    </div>
</template>

<script>
import ContributorJoin from './contributor-join.vue'
import Contributor from './contributor.vue'
export default {
  name: 'Contribution',
  components: {
    ContributorJoin,
    Contributor
  },
  props: {
    work: null,
    contributions: null
  },
  data () {
    return {
    }
  },
  methods: {
    onWorkContributionChanged (work) {
      this.$emit('workContributionChanged', work)
    }
  }
}
</script>

<style scoped>
</style>
