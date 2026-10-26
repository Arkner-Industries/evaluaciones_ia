<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtener_entrega, corregir_entrega } from '@/servicios/evaluaciones_servicio'
import { mensaje_de_error } from '@/servicios/api'
import { formatear_fecha, formatear_nota } from '@/utilidades/formatos'

const route = useRoute()
const router = useRouter()

const entrega = ref(null)
const correcciones = ref({})
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    entrega.value = await obtener_entrega(route.params.id)

    for (const respuesta of entrega.value.respuestas) {
        correcciones.value[respuesta.id] = {
            nota: respuesta.nota ?? '',
            comentario: respuesta.comentario ?? ''
        }
        }
    } catch (err) {
        error.value = mensaje_de_error(err, 'No se pudo cargar la entrega')
    } finally {
        cargando.value = false
    }
})


const nota_final = computed(() => {
    if (!entrega.value) return null
        const notas = entrega.value.respuestas
        .map((r) => correcciones.value[r.id]?.nota)
        .filter((nota) => nota !== '' && nota !== null && nota !== undefined)
        if (notas.length < entrega.value.respuestas.length) return null
    return notas.reduce((suma, nota) => suma + Number(nota), 0) / notas.length
})

const guardar = async () => {
    error.value = ''
    guardando.value = true
    try {
        await corregir_entrega(
        route.params.id,
        entrega.value.respuestas.map((respuesta) => ({
            id_respuesta: respuesta.id,
            nota: correcciones.value[respuesta.id].nota,
            comentario: correcciones.value[respuesta.id].comentario
        }))
        )
        router.push({ name: 'profesor-entregas', params: { id: entrega.value.id_evaluacion } })
    } catch (err) {
        error.value = mensaje_de_error(err, 'No se pudo guardar la correccion')
    } finally {
        guardando.value = false
    }
}
</script>


<template>
    <p v-if="cargando" class="vacio">Cargando...</p>

    <template v-else-if="!entrega">
        <p class="alerta alerta--error" role="alert">{{ error }}</p>
        <div class="acciones">
            <RouterLink :to="{ name: 'evaluaciones-profesor' }" class="boton boton--secundario">Volver a mis evaluaciones</RouterLink>
        </div>
    </template>

    <template v-else>
        <h1 class="titulo-pagina">Corregir: {{ entrega.titulo }}</h1>
        <p class="subtitulo-pagina">{{ entrega.alumno }} · entregada el {{ formatear_fecha(entrega.fecha) }}</p>

        <form class="formulario formulario--ancho" @submit.prevent="guardar">
            <section v-for="(respuesta, indice) in entrega.respuestas" :key="respuesta.id" class="tarjeta pregunta">
                <h2 class="titulo__seccion">{{ indice + 1 }}. {{ respuesta.pregunta }}</h2>

                <div class="bloque">
                    <p class="bloque__etiqueta">Respuesta del alumno</p>
                    <p class="bloque__texto">{{ respuesta.respuesta || '(sin respuesta)' }}</p>
                </div>

                <div class="bloque bloque--correcta">
                    <p class="bloque__etiqueta">Respuesta correcta</p>
                    <p class="bloque__texto">{{ respuesta.respuesta_correcta }}</p>
                </div>

                <div class="campo">
                    <label class="campo__etiqueta" :for="`nota-${respuesta.id}`">Nota (0 a 10)</label>
                    <input
                        :id="`nota-${respuesta.id}`"
                        v-model.number="correcciones[respuesta.id].nota"
                        class="campo__input"
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        required
                    />
                </div>

                <div class="campo">
                    <label class="campo__etiqueta" :for="`comentario-${respuesta.id}`">Comentario para el alumno (opcional)</label>
                    <textarea
                        :id="`comentario-${respuesta.id}`"
                        v-model="correcciones[respuesta.id].comentario"
                        class="campo__input"
                        rows="3"
                    />
                </div>
            </section>

            <p class="resumen">
                Nota final:
                <strong>{{ nota_final === null ? '-' : formatear_nota(nota_final) }}</strong>
                <span class="resumen__ayuda"> (promedio de las notas de cada respuesta)</span>
            </p>

            <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>

            <div class="acciones">
                <button class="boton" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar corrección' }}</button>
                <RouterLink
                :to="{ name: 'profesor-entregas', params: { id: entrega.id_evaluacion } }"
                class="boton boton--secundario"
                >
                Cancelar
                </RouterLink>
            </div>
        </form>
    </template>
</template>


<style scoped>
.formulario--ancho {
  max-width: 720px;
}

.pregunta {
  margin-bottom: var(--espacio-4);
}

.bloque {
  padding: var(--espacio-3);
  margin-bottom: var(--espacio-3);
  background: var(--fondo);
  border: 1px solid var(--borde);
  border-radius: var(--radio-chico);
}
.bloque--correcta {
  background: var(--exito-fondo);
}
.bloque__etiqueta {
  margin-bottom: var(--espacio-1);
  font-size: 0.8rem;
  color: var(--texto-suave);
}
.bloque__texto {
  white-space: pre-line;
}

.resumen {
  margin-bottom: var(--espacio-4);
  font-size: 1.05rem;
}
.resumen__ayuda {
  font-size: 0.85rem;
  color: var(--texto-suave);
}
</style>
