<template>
  <div>
    <div v-if="$store.state.securityContext.identity.id">
      User Home
      <!-- <avatar :size="100" :src="avatarUrl" :rounded="false" style="margin-right: 2px"
        :username="$store.state.securityContext.identity.name"
        :title="$store.state.securityContext.identity.name"/> -->
      <user-avatar :size="100" :rounded="false"
        :userId="$store.state.securityContext.identity.id"
        :username="$store.state.securityContext.identity.name"/>

      <el-button type="primary" size="mini" @click="onChangePasswordDialog" icon="el-icon-circle-plus-outline">修改密码</el-button>
      <el-button type="primary" size="mini" @click="onChangeAvatarDialog" icon="el-icon-circle-plus-outline">修改头像</el-button>

      <el-dialog v-if="showChangePasswordDialog === true" title="Change Password" :visible="true" width="80%"
                :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
        <user-password-change @action-result="onChangePasswordResult"/>
      </el-dialog>

      <image-upload field="file" @cropUploadSuccess="cropUploadSuccess" @cropUploadFail="cropUploadFail"
        v-model="showChangeAvatarDialog" :width="300" :height="300" :url="avatarUrl" imgFormat="png"/>

    </div>
    <div v-if="!$store.state.securityContext.identity.id">
        Unauhtorized
    </div>
  </div>
</template>

<script>
import { client } from '../flywheel'
import UserPasswordChange from './UserPasswordChange'
import ImageUpload from 'vue-image-crop-upload/upload-2.vue'
import UserAvatar from './UserAvatar'

export default {
  name: 'UserHome',
  components: {
    UserPasswordChange,
    ImageUpload,
    UserAvatar
  },
  data () {
    return {
      showChangePasswordDialog: false,
      showChangeAvatarDialog: false
    }
  },
  computed: {
    avatarUrl () {
      return client.withPath('/v1/account-avatars/' + this.$store.state.securityContext.identity.id)
    }
  },
  methods: {
    onChangePasswordDialog () {
      this.showChangePasswordDialog = true
    },
    onChangePasswordResult (result) {
      this.showChangePasswordDialog = false
    },
    onChangeAvatarDialog () {
      this.showChangeAvatarDialog = true
    },
    onChangeAvatarResult (result) {
      this.showChangeAvatarDialog = false
    },
    cropUploadSuccess (jsonData, field) {
      debugger
    },
    cropUploadFail (status, field) {
      debugger
      this.$notify.error({ title: 'Error', message: 'status ' + status })
    }
  }
}
</script>

<style scoped>
</style>
