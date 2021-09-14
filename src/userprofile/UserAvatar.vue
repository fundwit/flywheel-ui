<template>
  <avatar :src="avatarUrl" :username="username" :title="username" :size="size?size:27" :rounded="rounded" :parser="parser"/>
</template>

<script>
import { client } from '../flywheel'
import Avatar from 'vue-avatar'

export default {
  name: 'UserAvatar',
  components: {
    Avatar
  },
  props: {
    userId: null,
    username: null,
    rounded: null,
    size: null
  },
  computed: {
    avatarUrl () {
      return client.withPath('/v1/account-avatars/' + this.userId)
    }
  },
  methods: {
    parser (name) {
      if (!name) {
        return '-'
      }

      return name.substring(0, 2).toUpperCase()
    }
  }
}
</script>

<style scoped>
</style>
