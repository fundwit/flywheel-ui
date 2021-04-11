
export const categoryStyle = function (category) {
  if (category === 1) {
    return {
      style: '',
      themeIcon: 'el-icon-s-order',
      backgroundStyle: {
        'background-color': '#daf3f8'
      }
    }
  } else if (category === 2) {
    return {
      style: 'warning',
      themeIcon: 'el-icon-stopwatch',
      backgroundStyle: {
        'background-color': '#fcf7cd'
      }
    }
  } else if (category === 3) {
    return {
      style: 'success',
      themeIcon: 'el-icon-circle-check',
      backgroundStyle: {
        'background-color': '#d9f8c4'
      }
    }
  } else if (category === 4) {
    return {
      style: 'info',
      themeIcon: 'el-icon-circle-close',
      backgroundStyle: {
        'background-color': '#e2e2e2'
      }
    }
  }
}
