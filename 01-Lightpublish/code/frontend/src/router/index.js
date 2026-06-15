import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '../views/WelcomeView.vue'
import EHomeView from '@/views/EHomeView.vue'
import HomeView from '@/views/HomeView.vue'
import TLeadView from '@/views/TLeadView.vue'
import LoginView from '@/views/LoginView.vue'
import ArtListView from '@/views/ArtListView.vue'
import ArtDetailView from '@/views/ArtDetailView.vue'
import CreateView from '@/views/CreateView.vue'
import UserCView from '@/views/UserCView.vue'


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
      component: () => import('@/views/EHomeView.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      children:[
         {
          path: '',
          name: 'techlead',
          component: () => import('../views/TLeadView.vue'),    
         },
         {
          path: '/artlist',
          name: 'articlelist',
          component: () => import('../views/ArtListView.vue'),    
         },
          {
          path: '/artlist/:id',
          name: 'artdetail',
          component: () => import('../views/ArtDetailView.vue'),    
         },
         {
          path: '/create',
          name: 'create',
          component: () => import('../views/CreateView.vue'),
         },
         {
          path: '/user',
          name: 'usercenter',
          component: () => import('../views/UserCView.vue'),
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
    //   component: () => import('../views/ArtListView.vue'),
    // },
    // {
    //   path: '/create',
    //   name: 'create',
    //   component: () => import('../views/CreateView.vue'),
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
