import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '../views/WelcomeView.vue'
import ehome from '@/views/ehome.vue'
import index from '@/Layout/index.vue'
import pilot from '@/views/lead/pilot.vue'
import LoginView from '@/views/LoginView.vue'
import list from '@/views/read/list.vue'
import detail from '@/views/read/detail.vue'
import edit from '@/views/write/edit.vue'
import user from '@/views/user/user.vue'


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
          component: () => import('../views/lead/pilot.vue'),    
         },
         {
          path: '/artlist',
          name: 'articlelist',
          component: () => import('../views/read/list.vue'),    
         },
          {
          path: '/artlist/:id',
          name: 'artdetail',
          component: () => import('../views/read/detail.vue'),    
         },
         {
          path: '/create',
          name: 'create',
          component: () => import('../views/write/edit.vue'),
         },
         {
          path: '/user',
          name: 'usercenter',
          component: () => import('../views/user/user.vue'),
         },
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
