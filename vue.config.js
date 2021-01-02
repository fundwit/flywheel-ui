
const path = require('path')
const apiMocker = require('mocker-api')

module.exports = {
  devServer: {
    // before(app) {
    //   // app.get('/api/v1/works', (req, res) => {
    //   //   res.json([{name: "test"}])
    //   // })
    //   apiMocker(app, path.resolve("./tests/mocker/index.js"), {
    //     proxy: {
    //       '/api': 'https://flywheel-core.fundwit.com/'
    //     },
    //     pathRewrite: {'^/api': ''},
    //   })
    // },
    proxy: {
      '/api': {
        target: "https://flywheel-core.fundwit.com/",
        changeOrigin: true,
        pathRewrite: {'^/api': ''}
      }
    }
  }
}
