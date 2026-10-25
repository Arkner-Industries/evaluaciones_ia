<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import tarjeta_datos from '@/componentes/ui/tarjeta_datos.vue';
import { listar_grupo_alumno } from '../../servicios/servicio_grupos';
import { listar_evaluaciones_alumno } from '../../servicios/evaluaciones_servicio';
import { formatear_nota } from '@/utilidades/formatos'
import { RouterLink } from 'vue-router';

const auth = useAuthStore()
const grupos = ref([])
const evaluaciones = ref([])
const error = ref('')

const pendientes = computed(() => evaluaciones.value.filter((e) => e.estado === 'pendiente').length);

const promedio = computed (() => {
    const notas = evaluaciones.value.filter((e) => e.nota !== undefined && e.nota !== null).map((e) => e.nota)
    if (notas.length === 0) return null
    return notas.reduce((suma, num) => suma + num, 0) / notas.length
});

onMounted( async () => {
    try {
        ;[grupos.value, evaluaciones.value] = await Promise.all([
            listar_grupo_alumno(),
            listar_evaluaciones_alumno()
        ])
    } catch {
        error.value = 'No se pudieron cargar los datos'
    }
});
</script>


<template>
    <h1 calss="titulo_pagina">Hola, {{ auth.usuario?.nombre_usuario }}</h1>
    <p calss="subtitulo_pagina">Tu resumen de grupos y evaluaciones.</p>

    <p v-if="error" class="alerta alerta--error" role="alert">{{ error }}</p>

    <div calss="grilla">
        <tarjeta_datos etiqueta="Mis grupos" :valor="grupos.length" />

        <tarjeta_datos etiqueta="Evaluaciones pendientes" :valor="pendientes" />

        <tarjeta_datos etiqueta="Promedio" :valor="formatear_nota(promedio)" />
    </div>

    <div class="acciones">
        <router-link calss="boton" :to="{ name: 'grupos-alumno' }">Entrar a un grupo</router-link>
        <router-link class="boton boton--secundario" :to="{ name: 'resultados-alumno' }">Ver mis resultados</router-link>
    </div>
</template>