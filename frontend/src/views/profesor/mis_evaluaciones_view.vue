<script setup>
import { ref, onMounted } from 'vue'
import { listar_evaluaciones_profesor } from '@/servicios/evaluaciones_servicio';
import { formatear_fecha } from '@/utilidades/formatos'

const evaluaciones = ref([])
const cargando = ref(true)
const error = ref('')

onMounted( async () => {
    try {
        evaluaciones.value = await listar_evaluaciones_profesor()
    } catch {
        error.value = 'No se puderion cargar las evaluaciones'
    } finally {
        cargando.value = false
    }
})
</script>

<template>
    <h1 class="titulo-pagina">Mis evaluaciones</h1>
    <p class="subtitulo-pagina">Evaluaciones que creaste y cuantas entregas recibieron.</p>

    <div class="acciones">
        <RouterLink class="boton" :to="{ name: 'profesor-crear-evaluacion' }">Crear evaluacion</RouterLink>
    </div>

    <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>
    <p v-else-if="cargando" class="vacio">Cargando...</p>
    <p v-else-if="evaluaciones.length === 0" class="vacio">Todavia no creaste ninguna evaluacion.</p>

    <ul v-else class="lista">
        <li v-for="evaluacion in evaluaciones" :key="evaluacion.id" class="lista-item">
            <div>
                <p class="lista-titulo">{{ evaluacion.titulo }}</p>

                <p class="lista-detalle">{{ evaluacion.grupo || 'Sin grupo' }} · {{ formatear_fecha(evaluacion.fecha) }} · {{ evaluacion.preguntas }} preguntas</p>
            </div>

            <span class="etiqueta">{{ evaluacion.entregas }} entregas</span>
        </li>
  </ul>
</template>