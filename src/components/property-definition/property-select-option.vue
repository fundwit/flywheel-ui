<template>
  <span>
    <el-tag :key="e" v-for="e in selectEnums" :closable="editable" :disable-transitions="false"
       @close="handleClose(e)">{{e}}</el-tag>

    <span v-if="editable">
      <el-input class="input-new-item" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"/>

      <el-button v-else class="button-new-item" size="small" @click="showInput">+ New</el-button>
    </span>
  </span>
</template>

<script>
export default {
  name: 'PropertySelectOption',
  props: {
    initOptions: null,
    editable: null
  },
  data () {
    return {
      selectEnums: this.initOptions && this.initOptions.selectEnums ? this.initOptions.selectEnums : [],

      inputVisible: false,
      inputValue: ''
    }
  },
  methods: {
    handleClose (tag) {
      this.selectEnums.splice(this.selectEnums.indexOf(tag), 1)
      this.$emit('selectOptionsChanged', { selectEnums: this.selectEnums })
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm () {
      const inputValue = this.inputValue
      if (inputValue) {
        this.selectEnums.push(inputValue)
        this.$emit('selectOptionsChanged', { selectEnums: this.selectEnums })
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  }
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-item {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-item {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
