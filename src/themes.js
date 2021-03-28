
export const categoryStyle = function (category) {
  if (category === 1) {
    return {
      style: ''
    }
  } else if (category === 2) {
    return {
      style: 'warning'
    }
  } else if (category === 3) {
    return {
      style: 'info'
    }
  }
}
