<script setup>
import { ref, onMounted } from 'vue'
import { listar_grupos_profesor } from '@/servicios/servicio_grupos';

const grupos = ref([])
const cargando = ref(true)
const error = ref('')

onMounted( async () => {
    try {
        grupos.value = await listar_grupos_profesor() 
    } catch {
        error.value = 'No se puderion cargar los grupos'
    } finally {
        cargando.value = false
    }
})
</script>

<template>
    <h1 class="titulo-pagina">Mis grupos</h1>
    <p class="subtitulo-pagina">Comparti el codigo del grupo con tus alumnos para que puedan entrar.</p>

    <div class="acciones">
        <RouterLink class="boton" :to="{ name: 'profesor-crear-grupo' }">Crear grupo</RouterLink>
    </div>

    <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>
    <p v-else-if="cargando" class="vacio">Cargando...</p>
    <p v-else-if="grupos.length === 0" class="vacio">Todavia no creaste ningun grupo.</p>

    <ul v-else class="lista">
        <li v-for="grupo in grupos" :key="grupo.id" class="lista-item">
            <div>
                <p class="lista__titulo">{{ grupo.nombre }}</p>
                <p class="lista__detalle">{{ grupo.alumnos }} alumnos</p>
            </div>
            <span class="etiqueta" title="Codigo para que los alumnos entren">Código: {{ grupo.codigo }}</span>
        </li>
    </ul>
</template>
