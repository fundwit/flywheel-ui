<template>
  <div>
    <div v-if="$store.state.securityContext.identity.id">
      User Home
      <div>
        Username: {{$store.state.securityContext.identity.name}}
      </div>
      <div>
         Nickname: {{$store.state.securityContext.identity.nickname}}
      </div>
      <user-avatar :size="100" :rounded="false"
        :userId="$store.state.securityContext.identity.id"
        :username="$store.state.securityContext.identity.displayName"/>
      <el-button type="primary" size="mini" @click="onChangePasswordDialog" icon="el-icon-circle-plus-outline">修改密码</el-button>
      <el-button type="primary" size="mini" @click="onChangeAvatarDialog" icon="el-icon-circle-plus-outline">修改头像</el-button>
      <el-button type="primary" size="mini" @click="onChangeNicknameDialog" icon="el-icon-circle-plus-outline">修改昵称</el-button>

      <el-dialog v-if="showChangePasswordDialog === true" title="Change Password" :visible="true" width="80%"
                :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
        <user-password-change @action-result="onChangePasswordResult"/>
      </el-dialog>

      <el-dialog v-if="showChangeNicknameDialog === true" title="Change Nickname" :visible="true" width="80%"
                :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false">
        <user-nickname-change :originNickname="$store.state.securityContext.identity.nickname" @action-result="onChangeNicknameResult"/>
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
import UserNicknameChange from './UserNicknameChange'
import ImageUpload from 'vue-image-crop-upload/upload-2.vue'
import UserAvatar from './UserAvatar'

export default {
  name: 'UserHome',
  components: {
    UserPasswordChange,
    UserNicknameChange,
    ImageUpload,
    UserAvatar
  },
  data () {
    return {
      showChangePasswordDialog: false,
      showChangeAvatarDialog: false,
      showChangeNicknameDialog: false
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

    onChangeNicknameDialog () {
      this.showChangeNicknameDialog = true
    },
    onChangeNicknameResult (result) {
      this.showChangeNicknameDialog = false
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
