import { expect } from 'chai'
import computeOrderChanges from '@/orders'
import Vue from 'vue'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

describe('computeOrderChanges', () => {
  it('should be able to compute move forward', () => {
    expect(computeOrderChanges([
      { id: 0, orderInState: 3 },
      { id: 1, orderInState: 10, index: 111 },
      { id: 3, orderInState: 10 },
      { id: 2, orderInState: 10 },
      { id: 4, orderInState: 20 }
    ], 2, 3)).to.eql([
      { id: 3, newOrder: 9, oldOrder: 10, index: undefined },
      { id: 1, newOrder: 8, oldOrder: 10, index: 111 }
    ])
  })

  it('should be able to compute move afterward', () => {
    expect(computeOrderChanges([
      { id: 0, orderInState: 3 },
      { id: 2, orderInState: 10, index: 111 },
      { id: 1, orderInState: 10 },
      { id: 3, orderInState: 10 },
      { id: 4, orderInState: 20 }
    ], 2, 1)).to.eql([
      { id: 1, newOrder: 11, oldOrder: 10, index: undefined },
      { id: 3, newOrder: 12, oldOrder: 10, index: undefined }
    ])
  })

  it('should be able to compute move to first', () => {
    expect(computeOrderChanges([
      { id: 2, orderInState: 10 },
      { id: 0, orderInState: 3 },
      { id: 1, orderInState: 10 },
      { id: 3, orderInState: 20 }
    ], 0, 2)).to.eql([
      { id: 2, newOrder: 2, oldOrder: 10, index: undefined }
    ])
  })

  it('should be able to compute move to last', () => {
    expect(computeOrderChanges([
      { id: 0, orderInState: 3 },
      { id: 2, orderInState: 10 },
      { id: 3, orderInState: 20 },
      { id: 1, orderInState: 10 }
    ], 3, 1)).to.eql([
      { id: 1, newOrder: 21, oldOrder: 10, index: undefined }
    ])
  })

  it('should be able to compute move without change', () => {
    expect(computeOrderChanges([
      { id: 0, orderInState: 0 },
      { id: 3, orderInState: 5 },
      { id: 1, orderInState: 10 },
      { id: 2, orderInState: 20 },
      { id: 4, orderInState: 30 }
    ], 1, 3)).to.eql([])
  })
})
