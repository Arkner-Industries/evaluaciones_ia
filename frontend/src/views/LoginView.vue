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

async function enviar() {
  error.value = ''
  cargando.value = true
  try {
    await auth.login(nombre_usuario.value, contrasena.value)
    router.push('/')
  } catch (e) {
    error.value = e.message || 'No se pudo iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="enviar">
    <h1>Iniciar sesión</h1>
    <input v-model="nombre_usuario" placeholder="Usuario o email" required />
    <input v-model="contrasena" type="password" placeholder="Contraseña" required />
    <p v-if="error">{{ error }}</p>
    <button :disabled="cargando">{{ cargando ? 'Entrando...' : 'Entrar' }}</button>
  </form>
</template>