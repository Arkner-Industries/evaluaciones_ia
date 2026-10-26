import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'


import login_view from '@/views/auth/login_view.vue'
import registro_alumno_view from '@/views/auth/registro_alumno_view.vue'
import registro_profesor_view from '@/views/auth/registro_profesor_view.vue'
import profesor_layout from '@/layouts/profesor_layout.vue'
import alumno_layout from '@/layouts/alumno_layout.vue'



const ruta_inicial = (auth) => {
	if (auth.es_profesor) return {name: 'dashboard-profesor'}
	if (auth.es_alumno) return { name: 'dashboard-alumno' }
	return null
}

const router = createRouter({
  	history: createWebHistory(),
  	routes: [
		{ 
			path: '/login', 
			name: 'login', 
			component: login_view, 
			meta: { solo_invitados: true } 
		},

		{ 
			path: '/registro-profesor', 
			name: 'registro-profesor', 
			component: registro_profesor_view, 
			meta: { solo_invitados: true } 
		},

		{ 
			path: '/registro-alumno', 
			name: 'registro-alumno', 
			component: registro_alumno_view, 
			meta: { solo_invitados: true } 
		},
	
		{ 
			path: '/', 
			name: 'inicio', 
			redirect: () => ruta_inicial(useAuthStore()) || { name: 'login' } 
		},

		{
			path: '/profesor',
			component: profesor_layout,
			meta: { requiereAuth: true, rol: 'profesor' },
			children: [
				{ path: '', name: 'dashboard-profesor', component: () => import('@/views/profesor/dashboard_profesor_view.vue') },
				{ path: 'grupos', name: 'grupos-profesor', component: () => import('@/views/profesor/mis_grupos_view.vue') },
				{ path: 'grupos/nuevo', name: 'profesor-crear-grupo', component: () => import('@/views/profesor/crear_grupo_view.vue') },
				{ path: 'evaluaciones', name: 'evaluaciones-profesor', component: () => import('@/views/profesor/mis_evaluaciones_view.vue') },
				{ path: 'evaluaciones/nueva', name: 'profesor-crear-evaluacion', component: () => import('@/views/profesor/crear_evaluacion_view.vue') },
				{ path: 'evaluacion/:id/entregas', name: 'profesor-entregas', component: () => import('@/views/profesor/') }
			]
		},

		{
			path: '/alumno',
			component: alumno_layout,
			meta: { requiereAuth: true, rol: 'alumno' },
			children: [
				{ path: '', name: 'dashboard-alumno', component: () => import('@/views/alumno/dashboard_alumno.vue') },
				{ path: 'grupos', name: 'grupos-alumno', component: () => import('@/views/alumno/mis_grupos_view.vue') },
				{ path: 'evaluaciones', name: 'evaluaciones-alumno', component: () => import('@/views/alumno/mis_evaluaciones_view.vue') },
				{ path: 'resultados', name: 'resultados-alumno', component: () => import('@/views/alumno/mis_resultado_view.vue') }
			]
		},

		{ path: '/:pathMatch(.*)*', redirect: { name: 'inicio' } }
  ]
})

router.beforeEach((to) => {
	const auth = useAuthStore()

	if (auth.esta_autenticado && !ruta_inicial(auth)) auth.logout()
	
	if (to.meta.requiereAuth && !auth.esta_autenticado) return { name: 'login' }

	if (to.meta.solo_invitados && auth.esta_autenticado) return ruta_inicial(auth)
	
	if (to.meta.rol && auth.usuario?.rol !== to.meta.rol) return ruta_inicial(auth)
})

export default router