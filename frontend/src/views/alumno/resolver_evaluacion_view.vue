<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { obtener_evaluacion_alumno, entregar_evaluacion } from '@/servicios/evaluaciones_servicio'
import { mensaje_de_error } from '@/servicios/api';
import { formatear_fecha } from '@/utilidades/formatos';

const route = useRoute()
const router = useRouter()

const evaluacion = ref(null)
const respuestas = ref({})
const cargando = ref(true)
const enviando = ref(false)
const error = ref('')

onMounted( async () => {
    try {
        evaluacion.value = await obtener_evaluacion_alumno(route.params.id)

        for (const pregunta of evaluacion.value.preguntas) {
            respuestas.value[pregunta.id] = ''
        }
    } catch (err) {
        error.value = mensaje_de_error(err, 'No se a podido cargar las evalauciones')
    } finally {
        cargando.value = false
    }
})

const enviar = async () => {
    error.value = ''
    enviando.value = true

    try {
        await entregar_evaluacion(
            route.params.id,
            evaluacion.value.preguntas.map((pregunta) => ({
                id_pregunta: pregunta.id,
                respuesta: respuestas.value[pregunta.id]
            }))
        )

        router.push({ name: 'evaluaciones-alumno' })

    } catch (err) {
        error.value = mensaje_de_error(err, 'no se a podido cargar la evaluacion')
    } finally {
        enviando.value = false
    }
}
</script>


<template>
    <p v-if="cargando" class="vacio">Cargando...</p>

    <template v-else-if="!evaluacion">
        <p class="alerta alerta--error" role="alert">{{ error }}</p>
        <div class="acciones">
            <RouterLink :to="{ name: 'evaluaciones-alumno' }" class="boton boton--secundario">Volver a mis evaluaciones</RouterLink>
        </div>
    </template>

    <template v-else>
        <h1 class="titulo-pagina">{{ evaluacion.titulo }}</h1>
        <p class="subtitulo-pagina">{{ evaluacion.grupo }} · {{ formatear_fecha(evaluacion.fecha) }}</p>
        <p v-if="evaluacion.descripcion" class="descripcion">{{ evaluacion.descripcion }}</p>

        <form class="tarjeta formulario formulario--ancho" @submit.prevent="enviar">
            <div v-for="(pregunta, indice) in evaluacion.preguntas" :key="pregunta.id" class="campo">

                <label class="campo__etiqueta" :for="`pregunta-${pregunta.id}`">
                {{ indice + 1 }}. {{ pregunta.pregunta }}
                </label>

                <textarea
                    :id="`pregunta-${pregunta.id}`"
                    v-model="respuestas[pregunta.id]"
                    class="campo__input"
                    rows="4"
                    required
                />
            </div>

            <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>

            <div class="acciones">
                <button class="boton" :disabled="enviando">{{ enviando ? 'Entregando...' : 'Entregar evaluacion' }}</button>
                <RouterLink :to="{ name: 'evaluaciones-alumno' }" class="boton boton--secundario">Cancelar</RouterLink>
            </div>
        </form>
    </template>
</template>

<style scoped>
.formulario--ancho {
  max-width: 640px;
}

.descripcion {
  max-width: 640px;
  margin-bottom: var(--espacio-4);
  white-space: pre-line;
}
</style>
