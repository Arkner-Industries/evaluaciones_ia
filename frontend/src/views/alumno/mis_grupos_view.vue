<script setup>
import { ref, onMounted } from 'vue'
import { listar_grupo_alumno, unirse_a_agrupo } from '../../servicios/servicio_grupos';
import { mensaje_de_error } from '../../servicios/api';

const grupos = ref([])
const codigo = ref('')
const cargando = ref(true)
const enviando = ref(false)
const error = ref('')
const mensaje = ref('')

const cargar_grupo = async () => {
    try {
        grupos.value = await listar_grupo_alumno()
    } catch {
        error.value = 'No se a podido cargar tus grupos'
    } finally {
        cargando.value = false
    }
}

const entrar = async () => {
    error.value = ''
    mensaje.value = ''
    enviando.value = true

    try {
        const grupo = await unirse_a_agrupo(codigo.value)
        mensaje.value = `Entraste al grupo "${grupo.codigo}"`
        codigo.value = ''
        await cargar_grupo()
    } catch (err) {
        error.value = mensaje_de_error(err, 'No se puede entrar al grupo')
    } finally {
        enviando.value = false
    }
}

onMounted(cargar_grupo)
</script>


<template>
    <h1 class="titulo-pagina">Mis grupos</h1>
    <p class="subtitulo-pagina">Para entrar a un grupo nuevo, escribi el codigo que te dio tu profesor.</p>

    <form class="tarjeta formulario formulario--angosto" @submit.prevent="entrar">
        <div class="campo">
            <label class="campo-etiqueta" for="codigo">Codigo del grupo</label>
            <input id="codigo" v-model="codigo" class="campo-input" placeholder="Ej: PRG1-26" required />
        </div>

        <button class="boton" :disabled="enviando">{{ enviando ? 'Entrnado...' : 'Entrar al grupo' }}</button>
    
        <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>
        <p v-if="mensaje" class="alerta alerta--exito" role="alert">{{ mensaje }}</p>
    </form>

    <h2 class="titulo-seccion">Grupos donde estoy</h2>

    <p v-if="cargando" class="vacio">Cargando...</p>
    <p v-else-if="grupos.length === 0" class="vacio">Todavia no entraste a ningun grupo</p>

    <ul v-else class="lista">
        <li v-for="grupo in grupos" :key="grupo.id" class="lista-item">
            <p class="lista-titulo">{{ grupo.nombre }}</p>
            <p clas="lista-detalle">Profesor: {{ grupo.profesor }}</p>
        </li>
    </ul>
</template>


<style scoped>
.formulario--angosto {
  max-width: 460px;
  margin-bottom: var(--espacio-6);
}
</style>