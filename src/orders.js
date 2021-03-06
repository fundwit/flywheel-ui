export default function computeOrderChanges (workOrders, newIndex, oldIndex) {
  const workCount = workOrders.length
  let preOrder = 0
  let postOrder = 0
  const changes = []

  if (newIndex < oldIndex) {
    // move forward:  minus order value
    for (let i = newIndex; i >= 0; i--) {
      if (!workOrders[i + 1]) {
        continue
      }

      preOrder = workOrders[i].orderInState
      postOrder = workOrders[i + 1].orderInState
      if (preOrder >= postOrder) {
        const oldOrder = workOrders[i].orderInState
        workOrders[i].orderInState = postOrder - 1
        changes.push({ id: workOrders[i].id, newOrder: workOrders[i].orderInState, oldOrder: oldOrder, index: workOrders[i].index })
      }
    }
  } else if (newIndex > oldIndex) {
    // move afterward: plus order value
    for (let i = newIndex; i < workCount; i++) {
      if (!workOrders[i - 1]) {
        continue
      }
      preOrder = workOrders[i - 1].orderInState
      postOrder = workOrders[i].orderInState
      if (preOrder >= postOrder) {
        const oldOrder = workOrders[i].orderInState
        workOrders[i].orderInState = preOrder + 1
        changes.push({ id: workOrders[i].id, newOrder: workOrders[i].orderInState, oldOrder: oldOrder, index: workOrders[i].index })
      }
    }
  }
  return changes
}
