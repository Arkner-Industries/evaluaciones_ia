<script setup>
import dashboard_layout from '@/componentes/layout/dashboard_layout.vue';

const items = [
    { texto: 'Inicio', to: { name: 'dashboard-alumno' } },
    { texto: 'Mis grupos', to: { name: 'grupos-alumno' } },
    { texto: 'Evaluaciones', to: { name: 'evaluaciones-alumno' } },
    { texto: 'Mis resultados', to: { name: 'resultados-alumno' } }
]
</script>

<template>

    <dashboard_layout 
    titulo="Alumno" 
    :items="items" 
    />

</template>