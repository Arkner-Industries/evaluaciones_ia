import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegistroView from '@/views/RegistroView.vue'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/registro', name: 'registro', component: RegistroView },
    { path: '/', name: 'home', component: HomeView, meta: { requiereAuth: true } }
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiereAuth && !auth.estaAutenticado) return { name: 'login' }
  if ((to.name === 'login' || to.name === 'registro') && auth.estaAutenticado){ 
    return { name: 'home' } 
  }
})

export default router