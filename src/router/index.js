import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "about" */ '../pages/Dashboard.vue')
  },
  {
    path: '/works',
    name: 'WorkBacklog',
    component: () => import('../pages/WorkBacklog.vue')
  },
  {
    path: '/works/:id',
    name: 'WorkDetail',
    component: () => import('../pages/WorkDetailPage.vue')
  },
  {
    path: '/boards',
    name: 'Board',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../pages/Board.vue')
  },
  {
    path: '/workflows',
    name: 'WorkflowList',
    component: () => import('../pages/WorkflowList.vue')
  },
  {
    path: '/workflows/:id',
    name: 'WorkflowDetail',
    component: () => import('../pages/WorkflowDetail.vue')
  },
  {
    path: '/me',
    name: 'UserHome',
    component: () => import('../userprofile/UserHome')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
