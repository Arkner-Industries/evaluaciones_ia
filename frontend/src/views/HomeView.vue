<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function salir() {
  auth.logout()
  router.push('/login')
}
</script>

<template>

  <p>jajajasdaweaseaweasd</p>
  <div>
    <p>Hola {{ auth.usuario?.nombre_usuario }} ({{ auth.usuario?.rol }})</p>

    <button @click="salir">Cerrar sesión</button>
  </div>
</template>