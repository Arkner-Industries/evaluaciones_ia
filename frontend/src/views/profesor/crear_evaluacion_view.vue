<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { crear_evaluacion } from '@/servicios/evaluaciones_servicio';
import { listar_grupos_profesor } from '@/servicios/servicio_grupos';
import { mensaje_de_error } from '@/servicios/api';

const router = useRouter()

const pregunta_vacia = () => ({pregunta: '', respuesta_correcta: ''})

const titulo = ref('')
const descripcion = ref('')
const fecha = ref('')
const id_grupo = ref('')
const preguntas = ref([pregunta_vacia()])

const grupos = ref([])
const cargando = ref(false)
const error = ref('')


onMounted(async () => {
    try {
        grupos.value = await listar_grupos_profesor()
    } catch {
        error.value = 'No se pudieron cargar los grupos'
    }
})

const agregar_pregunta = () => preguntas.value.push(pregunta_vacia())
const quitar_pregunta = (indice) => preguntas.value.splice(indice, 1)


const enviar = async () => {
    error.value = ''
    cargando.value = true

    try {
        await crear_evaluacion({
            titulo: titulo.value.trim(),
            descripcion: descripcion.value.trim(),
            fecha: fecha.value,
            id_grupo: id_grupo.value,
            pregutnas: preguntas.value
        })

        router.push({ name: 'profesor-evaluaciones' })
    } catch (err) {
        error.value = mensaje_de_error(err, 'No se pudo cargar la evaluacion')
    } finally {
        cargando.value = false
    }
}
</script>


<template>
    <h1 class="titulo-pagina">Crear evaluacion</h1>
    <p class="subtitulo-pagina">Escribi las preguntas y la respuesta correcta de cada una; la IA las usara para corregir.</p>

    <form class="tarjeta formulario formulario--ancho" @submit.prevent="enviar">
        <div class="campo">
            <label class="campo-etiqueta" for="titulo">Titulo</label>
            <input id="titulo" v-model="titulo" class="campo__input" required />
        </div>

        <div class="campo">
            <label class="campo-etiqueta" for="descripcion">Descripcion</label>
            <textarea id="descripcion" v-model="descripcion" class="campo__input" />
        </div>

        <div class="fila">
            <div class="campo">
                <label class="campo-etiqueta" for="fecha">Fecha</label>
                <input id="fecha" v-model="fecha" class="campo-input" type="date" required />
            </div>

            <div class="campo">
                <label class="campo-etiqueta" for="grupo">Grupo</label>

                <select id="grupo" v-model="id_grupo" class="campo-input" required>
                    <option value="" disabled>Elegi un grupo</option>
                    <option v-for="grupo in grupos" :key="grupo.id" :value="grupo.id">{{ grupo.nombre }}</option>
                </select>
            </div>
        </div>

        <h2 class="titulo-seccion">Preguntas</h2>

        <div v-for="(item, indice) in preguntas" :key="indice" class="pregunta">
            <div class="campo">
                <label class="campo-etiqueta" :for="`pregunta-${indice}`">Pregunta {{ indice + 1 }}</label>
                <textarea :id="`pregunta-${indice}`" v-model="item.pregunta" class="campo-input" required />
            </div>

            <div class="campo">
                <label class="campo__etiqueta" :for="`respuesta-${indice}`">Respuesta correcta</label>
                <textarea :id="`respuesta-${indice}`" v-model="item.respuesta_correcta" class="campo-input" required />
            </div>

            <button
            v-if="preguntas.length > 1"
            type="button"
            class="boton boton--secundario boton--chico"
            @click="quitar_pregunta(indice)"
            >
            Quitar pregunta
            </button>
        </div>

        <div class="acciones">
            <button type="button" class="boton boton--secundario" @click="agregar_pregunta">+ Agregar pregunta</button>
        </div>

        <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>

        <button class="boton" :disabled="cargando">{{ cargando ? 'Guardando...' : 'Crear evaluacion' }}</button>
    </form>
</template>


<style scoped>
.formulario--ancho {
  max-width: 640px;
}


.fila {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--espacio-3);
}


.pregunta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--espacio-3);
  padding: var(--espacio-4);
  background: var(--fondo);
  border: 1px solid var(--borde);
  border-radius: var(--radio-chico);
}
.pregunta .campo {
  width: 100%;
}
</style>