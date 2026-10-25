<script setup>
import dashboard_layout from '@/componentes/layout/dashboard_layout.vue';

const items = [
    { texto: 'Inicio', to: { name: 'dashboard-profesor' } },
    { texto: 'Mis grupos', to: { name: 'grupos-profesor' } },
    { texto: 'Crear grupo', to: { name: 'profesor-crear-grupo' } },
    { texto: 'Mis evaluaciones', to: { name: 'evaluaciones-profesor' } },
    { texto: 'Crear evaluacion', to: { name: 'profesor-crear-evaluacion' } }
]
</script>

<template>

    <dashboard_layout 
    titulo="Profesor" 
    :items="items" 
    />
    
</template>