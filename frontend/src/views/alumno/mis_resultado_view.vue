<script setup>
import {ref, onMounted} from 'vue'
import { listar_resultado_alumno } from '../../servicios/evaluaciones_servicio';
import { formatear_fecha, formatear_nota } from '@/utilidades/formatos'

const resultados = ref([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
    try {
        resultados.value = await listar_resultado_alumno()
    } catch {
        error.value = 'No se pudieron cargar tus resultados'
    } finally {
        cargando.value = dalse
    }
})
</script>


<template>
    <h1 class="titulo-pagina">Mis resultados</h1>
    <p class="subtitulo-pagina">Tu nota y la correccion de la IA en cada evaluacion corregida.</p>

    <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>
    <p v-else-if="cargando" class="vacio">Cargando...</p>
    <p v-else-if="resultados.length === 0" class="vacio">Todavia no tenes evaluaciones corregidas.</p>

    <div v-else class="resultados">
        <details v-for="resultado in resultados" :key="resultado.id" class="tarjeta-resultado">
            <summary class="resultado-cabecera">
                <span>
                    <span class="lista-titulo">{{ resultado.titulo }}</span>
                    <span class="lista-detalle"> · {{ formatear_fecha(resultado.fecha) }}</span>
                </span>
                <span class="etiqueta etiqueta--exito">Nota {{ formatear_nota(resultado.nota) }}</span>
            </summary>

            <div v-for="(item, indice) in resultado.respuestas" :key="indice" class="resultado-respuesta">
                <p class="lista-titulo">{{ indice + 1 }}. {{ item.pregunta }}</p>

                <p><span class="lista-detalle">Tu respuesta:</span> {{ item.respuesta }}</p>

                <p><span class="lista-detalle">Corrección IA:</span> {{ item.correccion_ia }}</p>

                <p class="lista-detalle">Nota de la pregunta: {{ formatear_nota(item.nota) }}</p>
            </div>
        </details>
    </div>
</template>


<style scoped>
.resultados {
  display: flex;
  flex-direction: column;
  gap: var(--espacio-3);
}

.resultado-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espacio-4);
  cursor: pointer;
}

.resultado-respuesta {
  display: flex;
  flex-direction: column;
  gap: var(--espacio-1);
  padding-top: var(--espacio-4);
  margin-top: var(--espacio-4);
  border-top: 1px solid var(--borde);
}
</style>