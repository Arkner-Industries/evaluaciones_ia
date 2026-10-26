<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { listar_entregas_evaluacion } from '@/servicios/evaluaciones_servicio';
import { mensaje_de_error } from '@/servicios/api';
import { formatear_fecha, formatear_nota } from '@/utilidades/formatos';


const route = useRoute()

const evaluacion = ref(null)
const cargando = ref(true)
const error = ref('')

const estados = {
    entregada: { texto: 'Sin corregir', clase: 'etiqueta--aviso' },
    corregida: { texto: 'Corregida', calse: 'etiqueta--exito' }
}

onMounted( async () => {
    try {
        evaluacion.value = await listar_entregas_evaluacion()
    } catch (err) {
        error.value = mensaje_de_error(err, 'No se pudieron cargar las entregas')
    } finally {
        cargando.value = false
    }
})
</script>


<template>
    <h1 class="titulo-pagina">{{ evaluacion ? `Entregas: ${evaluacion.titulo}` : 'Entregas' }}</h1>
    <p class="subtitulo-pagina">Elegi una entrega para ver las respuestas del alumno y corregirla.</p>

    <div class="acciones">
        <RouterLink :to="{ name: 'evaluaciones-profesor' }" class="boton boton--secundario">Volver a mis evaluaciones</RouterLink>
    </div>

    <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>
    <p v-else-if="cargando" class="vacio">Cargando...</p>
    <p v-else-if="evaluacion.entregas.length === 0" class="vacio">Todavia no hay entregas para esta evaluacion.</p>

    <ul v-else class="lista">
        <li v-for="entrega in evaluacion.entregas" :key="entrega.id" class="lista__item">
            <div>
                <p class="lista__titulo">{{ entrega.alumno }}</p>
                <p class="lista__detalle">Entregada el {{ formatear_fecha(entrega.fecha) }}</p>
            </div>

            <div>
                <span v-if="entrega.estado === 'corregida'" class="lista__detalle">Nota: {{ formatear_nota(entrega.nota) }}&nbsp;</span>
                <span class="etiqueta" :class="estados[entrega.estado]?.clase">
                    {{ estados[entrega.estado]?.texto || entrega.estado }}
                </span>
                <RouterLink
                    class="boton boton--chico"
                    :to="{ name: 'profesor-corregir', params: { id: entrega.id } }"
                >
                {{ entrega.estado === 'corregida' ? 'Revisar' : 'Corregir' }}
                </RouterLink>
            </div>
        </li>
    </ul>
</template>
