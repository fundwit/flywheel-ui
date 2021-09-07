export default function computeOrderChanges (workOrders, idPropertyName, orderPropertyName, newIndex, oldIndex) {
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

      preOrder = workOrders[i][orderPropertyName]
      postOrder = workOrders[i + 1][orderPropertyName]
      if (preOrder >= postOrder) {
        const oldOrder = workOrders[i][orderPropertyName]
        workOrders[i][orderPropertyName] = postOrder - 1
        changes.push({ [idPropertyName]: workOrders[i][idPropertyName], newOrder: workOrders[i][orderPropertyName], oldOrder: oldOrder, index: workOrders[i].index })
      }
    }
  } else if (newIndex > oldIndex) {
    // move afterward: plus order value
    for (let i = newIndex; i < workCount; i++) {
      if (!workOrders[i - 1]) {
        continue
      }
      preOrder = workOrders[i - 1][orderPropertyName]
      postOrder = workOrders[i][orderPropertyName]
      if (preOrder >= postOrder) {
        const oldOrder = workOrders[i][orderPropertyName]
        workOrders[i][orderPropertyName] = preOrder + 1
        changes.push({ [idPropertyName]: workOrders[i][idPropertyName], newOrder: workOrders[i][orderPropertyName], oldOrder: oldOrder, index: workOrders[i].index })
      }
    }
  }
  return changes
}
