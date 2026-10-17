import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegistroAlumnoView from '@/views/RegistroAlumnoView.vue'
import RegistroProfesorView from '@/views/RegistroProfesorView.vue'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },

    { path: '/registro-profesor', name: 'registro-profesor', component: RegistroProfesorView },

    { path: '/registro-alumno', name: 'registro-alumno', component: RegistroAlumnoView },
    
    { path: '/', name: 'home', component: HomeView, meta: { requiereAuth: true } }
  ]
})

router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiereAuth && !auth.esta_autenticado) return { name: 'login' }
    if ((to.name === 'login' || to.name === 'registro') && auth.esta_autenticado){ 
    return { name: 'home' } 
    }
})

export default router