import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './states/store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import security from './security'
import Moment from 'moment'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(security)
Vue.filter('formatDate', (value) => {
  if (value) {
    return Moment(value).format('YYYY-MM-DD')
  }
  return ''
})
Vue.filter('formatDateTimeMin', (value) => {
  if (value) {
    return Moment(value).format('YYYY-MM-DD HH:mm')
  }
  return ''
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
