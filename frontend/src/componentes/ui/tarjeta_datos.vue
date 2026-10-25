<script setup>
    defineProps ({
        etiqueta: { type: String, required: true },
        valor: { type: [Number, String], default: '-' }
    });
</script>

<template>
    <div class="tarjeta_datos">
        <p class="catos_valor">{{ valor }}</p>
        <p class="dato_etiquera">{{ etiqueta }}</p>
    </div>
</template>


<style scoped>
.dato { padding: var(--espacio-4) var(--espacio-6); }
.dato__valor { font-size: 2rem; font-weight: 700; color: var(--acento); }
.dato__etiqueta { font-size: 0.85rem; color: var(--texto-suave); }
</style>