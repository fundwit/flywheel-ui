import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './states/store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import security from './security'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(security)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
