<script setup>
import { ref } from 'vue'
import { crear_grupo } from '@/servicios/servicio_grupos';
import { mensaje_de_error } from '@/servicios/api';

const nombre = ref('')
const cargando = ref(false)
const error = ref('')
const grupo_creado = ref(null)

const enviar = async () => {
    error.value = ''
    grupo_creado.value = null
    cargando.value = true

    try {
        grupo_creado.value = await crear_grupo({ name: nombre.value.trim() })
        nombre.value = ''
    } catch (err) {
        error.value = mensaje_de_error(err, 'no se pudo crear el grupo')
    } finally {
        cargando.value = false
    }
}
</script>

<template>
    <h1 class="titulo-pagina">Crear grupo</h1>
    <p class="subtitulo-pagina">Al crearlo se genera un codigo que tus alumnos usan para entrar.</p>

    <form class="tarjeta formulario formulario--angosto" @submit.prevent="enviar">
        <div class="campo">
            <label class="campo-etiqueta" for="nombre">Nombre del grupo</label>
            <input id="nombre" v-model="nombre" class="campo-input" placeholder="Ej: Programación 1 - 2026" required />
        </div>

        <button class="boton" :disabled="cargando">{{ cargando ? 'Creando...' : 'Crear grupo' }}</button>

        <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>
        <p v-if="grupo_creado" class="alerta alerta--exito" role="alert">
        Grupo "{{ grupo_creado.nombre }}" creado. Codigo para compartir: <strong>{{ grupo_creado.codigo }}</strong>
        </p>
    </form>
</template>


<style scoped>
.formulario--angosto {
  max-width: 460px;
}
</style>