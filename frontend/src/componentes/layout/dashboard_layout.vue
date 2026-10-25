<script setup>
import barra_lateral_menu from './barra_lateral_menu.vue';

defineProps ({
    titulo: { type: String, required: true },
    items: { type: Array, required: true }
});
</script>

<template>
    <div class="dashboard">
        <barra_lateral_menu 
        :titulo="titulo" 
        :items="items" 
        />

        <main class="dashboard_contenido">
            <RouterView />
        </main>
    </div>
</template>


<style scope>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.dashboard_contenido {
  flex: 1;
  min-width: 0;
  padding: var(--espacio-8);
}

@media (max-width: 720px) {
  .dashboard { flex-direction: column; }
  .dashboard_contenido { padding: var(--espacio-4); }
}
</style>