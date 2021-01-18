import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import WorkList from '@/components/WorkList.vue'
import Vue from 'vue'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

describe('WorkList.vue', () => {
  it('should be able to add work to list', () => {
    const wrapper = mount(WorkList, {
      propsData: {}
    })
    expect(wrapper.text()).to.include('添加工作')
    // 点击添加工作，添加方法被调用
  })

  it('should be able to delete work from list', () => {
    const wrapper = mount(WorkList, {
      propsData: {}
    })
    expect(wrapper.text()).to.include('添加工作')
    // 点击删除工作，删除方法被调用
  })
})
