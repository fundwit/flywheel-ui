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
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../pages/ProjectDetailPage.vue')
  },
  {
    path: '/me',
    name: 'UserHome',
    component: () => import('../userprofile/UserHome')
  },
  {
    path: '/admin',
    name: 'AdminHome',
    component: () => import('../admin/AdminHome'),
    children: [
      {
        path: 'metrics',
        name: 'Metrics',
        component: () => import('../admin/pages/Metrics')
      },
      {
        path: 'projects',
        name: 'ProjectManage',
        component: () => import('../admin/pages/ProjectManage')
      },
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('../admin/pages/UserManage')
      },
      {
        path: 'notifications',
        name: 'NotificationManage',
        component: () => import('../admin/pages/NotificationManage')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
