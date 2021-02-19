import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "about" */ '../views/Dashboard.vue')
  },
  {
    path: '/works',
    name: 'WorkBacklog',
    component: () => import('../views/WorkBacklog.vue')
  },
  {
    path: '/boards',
    name: 'Board',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Board.vue')
  },
  {
    path: '/workflows',
    name: 'WorkflowList',
    component: () => import('../views/WorkflowList.vue')
  },
  {
    path: '/workflows/:id',
    name: 'WorkflowDetail',
    component: () => import('../views/WorkflowDetail.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
