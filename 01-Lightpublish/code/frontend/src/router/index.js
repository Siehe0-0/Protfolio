import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '../views/WelcomeView.vue'
import ehome from '@/views/ehome.vue'
import index from '@/Layout/index.vue'
import LoginView from '@/views/LoginView.vue'

import pilot from '@/views/01-lead/pilot.vue'
import list from '@/views/02-read/list.vue'
import detail from '@/views/02-read/detail.vue'
import edit from '@/views/03-write/edit.vue'
import user from '@/views/04-user/user.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
    },
     {
      path: '/ehome',
      name: 'ehome',
      component: () => import('@/views/ehome.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/Layout/index.vue'),
      children:[
         {
          path: '',
          name: 'techlead',
          component: () => import('../views/01-lead/pilot.vue'),    
         },
      ]
    },
    {
      path: '/artlist',
      name: 'articlelist',
      component: () => import('@/Layout/index.vue'),
      children: [
        {
          path: '',
          name: 'articlelist-index',
          component: () => import('../views/02-read/list.vue'),
        },
        {
          path: ':id',
          name: 'artdetail',
          component: () => import('../views/02-read/detail.vue'),
        }
      ]
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('@/Layout/index.vue'),
      children: [
        {
          path: '',
          name: 'create-index',
          component: () => import('../views/03-write/edit.vue'),
        }
      ]
    },
    {
      path: '/user',
      name: 'usercenter',
      component: () => import('@/Layout/index.vue'),
      children: [
        {
          path: '',
          name: 'usercenter-index',
          component: () => import('../views/04-user/user.vue'),
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue'),
    },
    // {
    //   path: '/artlist',
    //   name: 'articlelist',
    //   component: () => import('../views/list.vue'),
    // },
    // {
    //   path: '/create',
    //   name: 'create',
    //   component: () => import('../views/edit.vue'),
    // },
    
  ],
})

router.beforeEach((to, from, next) => {
  // 如果需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('token') || localStorage.getItem('user')
  
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
export default router
