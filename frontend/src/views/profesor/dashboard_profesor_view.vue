<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth';
import tarjeta_datos from '@/componentes/ui/tarjeta_datos.vue';
import { listar_grupos_profesor } from '@/servicios/servicio_grupos';
import { listar_evaluaciones_profesor } from '@/servicios/evaluaciones_servicio';

const auth = useAuthStore()
const grupos = ref([])
const evaluaciones = ref([])
const error = ref('')

const total_entregas = computed(() => evaluaciones.value.reduce((suma, e) => suma + e.entregas, 0))

onMounted(async () => {
    try {
        ;[grupos.value, evaluaciones.value] = await Promise.all([
            listar_grupos_profesor(),
            listar_evaluaciones_profesor()
        ])
    } catch {
        error.value = 'No se pudieron cargar losd atos'
    }
})
</script>

<template>
    <h1 class="titulo-pagina">Hola, {{ auth.usuario?.nombre_usuario }}</h1>
    <p class="subtitulo-pagina">Resumen de tus grupos y evaluaciones.</p>

    <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>

    <div class="grilla">
        <tarjeta_datos etiqueta="Grupos" :valor="grupos.length" />
        <tarjeta_datos etiqueta="Evaluaciones" :valor="evaluaciones.length" />
        <tarjeta_datos etiqueta="Entregas recibidas" :valor="total_entregas" />
    </div>

    <div class="acciones">
        <RouterLink class="boton" :to="{ name: 'profesor-crear-grupo' }">Crear grupo</RouterLink>
        <RouterLink class="boton" :to="{ name: 'profesor-crear-evaluacion' }">Crear evaluación</RouterLink>
    </div>
</template>
