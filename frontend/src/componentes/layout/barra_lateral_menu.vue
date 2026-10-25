<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

defineProps({
    titulo: { type: String, required: true },
    items: { type: Array, required: true }
});

const auth = useAuthStore();
const router = useRouter();

const salir = () => {
    auth.logout()
    router.push({ name: 'login' })
};
</script>

<template>
    <aside class="menu">

        <div class="menu_cabecera">
            <p class="menu_marca">EVA-IA</p>
            <p class="menu_rol">{{ titulo }}</p>
        </div>

        <nav class="menu_links">
            <RouterLink
                v-for = "item in items"
                :key = "item.texto"
                :to = "item.to"
                class = "menu_link"
                exact-active-class = "menu_link--activo"
            >
                {{ item.texto }}
            </RouterLink>
        </nav>

        <div class="menu_pie">
            <p clas="menu_usuario">
                {{ auth.usuario?.nombre_usuario }}
            </p>

            <button class="boton boton--secundario boton--chico" @click="salir">
                Cerrar sesion
            </button>
        </div>
    </aside>
</template>


<style scope>
.menu {
  display: flex;
  flex-direction: column;
  width: var(--ancho-menu);
  flex-shrink: 0;
  padding: var(--espacio-6) var(--espacio-4);
  background: var(--tarjeta);
  border-right: 1px solid var(--borde);
}

.menu_marca {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--acento);
}

.menu_rol {
  margin-bottom: var(--espacio-6);
  font-size: 0.8rem;
  color: var(--texto-suave);
}

.menu_links {
  display: flex;
  flex-direction: column;
  gap: var(--espacio-1);
  flex: 1;
}

.menu_link {
  padding: var(--espacio-2) var(--espacio-3);
  font-weight: 500;
  color: var(--texto);
  border-radius: var(--radio-chico);
}

.menu_link:hover {
  color: var(--texto);
  text-decoration: none;
  background: var(--fondo);
}

.menu_link--activo,
.menu_link--activo:hover {
  color: var(--acento);
  background: var(--acento-suave);
}

.menu_pie {
  display: flex;
  flex-direction: column;
  gap: var(--espacio-2);
  padding-top: var(--espacio-4);
  border-top: 1px solid var(--borde);
}

.menu_usuario {
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 720px) {
  .menu {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--borde);
  }
  .menu_rol { margin-bottom: var(--espacio-3); }
  .menu_links { flex-direction: row; flex-wrap: wrap; }
  .menu_pie { flex-direction: row; align-items: center; justify-content: space-between; }
}
</style>