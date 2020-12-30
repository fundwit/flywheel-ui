<template>
  <div>
    <!--使用draggable组件-->
    <div class="itxst">
      <div class="col" v-for="(works, stateName) in groupedWorks" :key="stateName">
        <div class="title" >{{stateName}} ({{works.length}})</div>

        <draggable v-model="groupedWorks[stateName]" group="site"  animation="300" dragClass="dragClass"  ghostClass="ghostClass" chosenClass="chosenClass" @start="onStart" @end="onEnd">
          <transition-group>
            <div class="item" v-for="item in groupedWorks[stateName]" :key="item.id">{{item.name}}</div>
          </transition-group>
        </draggable>
      </div>
<!--      <div  class="col">-->
<!--        <div class="title" >你可以把左边的元素拖到右边</div>-->
<!--        <draggable v-model="arr2" group="site" animation="300" dragClass="dragClass"  ghostClass="ghostClass" chosenClass="chosenClass" @start="onStart" @end="onEnd">-->
<!--          <transition-group>-->
<!--            <div class="item" v-for="item in arr2" :key="item.id">{{item.name}}</div>-->
<!--          </transition-group>-->
<!--        </draggable>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script>
// 导入draggable组件
import draggable from 'vuedraggable'
import client from '../flywheel'
import _ from 'lodash'
export default {
  // 注册draggable组件
  components: {
    draggable
  },
  data () {
    return {
      drag: false,
      // 定义要被拖拽对象的数组
      groupedWorks: {}
    }
  },
  mounted () {
    this.loadWorks()
  },
  methods: {
    loadWorks () {
      const mask = this.$loading({ lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(255,255,255,0.7)' })
      const vue = this
      client.queryWork().then((resp) => {
        // vue.$set('works', response.data.data)
        // group by state
        vue.groupedWorks = _.groupBy(resp.data, (v) => v.stateName)
        debugger
        // load and compute union status

        vue.total = resp.total
      }).catch((error) => {
        this.$notify.error({
          title: 'Error',
          message: '数据加载失败' + error
        })
      }).finally(() => {
        mask.close()
      })
    },
    onStart () {
      this.drag = true
    },
    onEnd () {
      this.drag = false
    }
  }
}
</script>
<style scoped>
  /*定义要拖拽元素的样式*/
  .ghostClass{
    background-color:  blue !important;
  }
  .chosenClass{
    background-color: red !important;
    opacity: 1!important;
  }
  .dragClass{
    background-color: blueviolet !important;
    opacity: 1 !important;
    box-shadow:none !important;
    outline:none !important;
    background-image:none !important;
  }
  .itxst{
    margin: 10px;

  }
  .title{
    padding: 6px 12px;
  }
  .col{
    width: 40%;
    flex: 1;
    padding: 10px;
    border: solid 1px #eee;
    border-radius:5px ;
    float: left;
  }
  .col+.col{
    margin-left: 10px;
  }

  .item{
    padding: 6px 12px;
    margin: 0px 10px 0px 10px;
    border:  solid 1px #eee;
    background-color: #f1f1f1;
  }
  .item:hover{
    background-color: #fdfdfd;
    cursor: move;
  }
  .item+.item{
    border-top:none ;
    margin-top: 6px;
  }
</style>
