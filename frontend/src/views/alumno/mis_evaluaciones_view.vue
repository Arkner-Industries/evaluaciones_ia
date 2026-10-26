<script>
import { ref, onMounted } from 'vue'
import { listar_evaluaciones_alumno } from '../../servicios/evaluaciones_servicio';
import { formatear_fecha, formatear_nota } from '@/utilidades/formatos'

const evaluaciones = ref([])
const cargadno = ref(true)
const error = ref('')

const estados = {
    pendiente: { texto: 'Pendiente', clase: 'etiqueta--aviso' },
    entregada: { texto: 'Entregada', clase: '' },
    corregida: { texto: 'Corregida', clase: 'etiqueta--exito' }
}

onMounted(async () => {
    try {
        evaluaciones.value = await listar_evaluaciones_alumno()
    } catch {
        error.value = 'No se a podido cargar las evaluaciones'
    } finally {
        cargadno.value = false
    }
})
</script>

<template>
    <h1 class="titulo-pagina">Evaluaciones</h1>
    <p class="subtitulo-pagina">Las evaluaciones de los grupos en los que estas.</p>

    <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>
    <p v-else-if="cargando" class="vacio">Cargando...</p>
    <p v-else-if="evaluaciones.length === 0" class="vacio">No tenes evaluaciones por ahora.</p>

    <ul v-else class="lista">
        <li v-for="evaluacion in evaluaciones" :key="evaluacion.id" class="lista__item">
            <div>
                <p class="lista__titulo">{{ evaluacion.titulo }}</p>
                <p class="lista__detalle">{{ evaluacion.grupo }} · {{ formatear_fecha(evaluacion.fecha) }}</p>
            </div>

            <div>
                <span v-if="evaluacion.estado === 'corregida'" class="lista__detalle">Nota: {{ formatear_nota(evaluacion.nota) }}&nbsp;</span>
                <RouterLink
                    v-if="evaluacion.estado === 'pendiente'"
                    :to="{ name: 'alumno-resolver-evaluacion', params: { id: evaluacion.id } }"
                    class="boton boton--chico"
                >
                Resolver
                </RouterLink>
                <span v-else class="etiqueta" :class="estados[evaluacion.estado]?.clase">
                {{ estados[evaluacion.estado]?.texto || evaluacion.estado }}
                </span>
            </div>
        </li>
    </ul>
</template>