<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const nombre_usuario = ref('')
const contrasena = ref('')
const error = ref('')
const cargando = ref(false)

const enviar = async () => {
	console.log('enviar funciona')
	error.value = ''
	cargando.value = true

    	try {
			console.log('llamado a auth.login')

        	await auth.login(nombre_usuario.value, contrasena.value)

			console.log('logim ok', auth.usuario)

			const nombre_destino = auth.es_profesor ? 'dashboard-profesor' : 'dashboard-alumno'

			console.log('navegado a', nombre_destino)
			
        	await router.push({ name: auth.es_profesor ? 'dashboard-profesor' : 'dashboard-alumno' })

    	} catch (err) {
			console.log('llego a catch')
        	error.value = err.message || 'No se pudo iniciar sesión'

    	} finally {
        	cargando.value = false
    	}
}
</script>

<template>
  <form @submit.prevent="enviar">
    <h1>Iniciar sesión</h1>

    <input 
      	v-model="nombre_usuario" 
      	placeholder="Usuario o email" 
      	autocomplete="username"
      	required 
    />

    <input 
      	v-model="contrasena" 
      	type="password" 
      	autocomplete="current-password"
      	placeholder="Contraseña" 
      	required 
    />

    <p v-if="error">
      	{{ error }}
    </p>

 
    <button type="submit" :disabled="cargando">
      	{{ cargando ? 'Entrando...' : 'Entrar' }}
    </button>
  </form>

  <p>
    ¿No tienes cuenta? Registrate aqui
    <RouterLink to="/registro-alumno">Soy alumno</RouterLink>
    <RouterLink to="/registro-profesor">Soy profesor</RouterLink>
  </p>
</template>