<script setup>
import {ref} from 'vue'

const formulario = ref ({
    nombre_usuario: '',
    contrasena: '',
    email: '',
    nombre: '',
    apellido: ''
})

const cargando = ref(false)
const mensaje = ref('')
const error = ref('')

const registrar = async () => {
    mensaje.value = ''
    error.value = ''
    cargando.value = true

try {
    const respuesta = await fetch(
        'http://localhost:4000/profesor/registro', 
        { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(formulario.value) 
        }
    )

    const texto = await respuesta.text()
    let datos = {}

    try {
        datos = texto ? JSON.parse(texto) : {}
    } catch {
        throw new Error(
            `Servidor no responde`
        )
    }

    if (!respuesta.ok) { 
        throw new Error(
            datos.mensaje || 'No se pudo registrar la cuenta'
        )  
    }

    mensaje.value = datos.mensaje || 'Registro completado'

    formulario.value = {
        nombre_usuario: '',
        contrasena: '',
        email: '',
        nombre: '',
        apellido: ''
    }

    } catch (err) {
        error.value = err.message || 'Error al conectar con el servidor'
    } finally {
        cargando.value = false
    }
}
</script>

<template>
    <main>
        <h1>Registro de profesor</h1>

        <form @submit.prevent="registrar">
            <label for="nombre_usuario">Nombre de usuario</label>
            <input
            id = "nombre_usuario"
            v-model.trim = "formulario.nombre_usuario"
            type = "text"
            autocomplete = "username"
            required
            />

            <label for="contrasena">Contraseña</label>
            <input
            id = "contrasena"
            v-model = "formulario.contrasena"
            type = "password"
            autocomplete = "new-password"
            required
            />

            <label for="email">Correo electronico</label>
            <input
            id = "email"
            v-model.trim = "formulario.email"
            type = "email"
            autocomplete = "email"
            required
            />

            <label for="nombre">Nombre</label>
            <input
            id = "nombre"
            v-model.trim = "formulario.nombre"
            type = "text"
            autocomplete = "given-name"
            required
            />

            <label for="apellido">Apellido</label>
            <input
            id = "apellido"
            v-model.trim = "formulario.apellido"
            type = "text"
            autocomplete = "family-name"
            required
            />

            <button type="sumit" :disabled="cargando">
                {{  cargando ? 'Registrando...' : 'Crear cuenta'  }}
            </button>

            <p v-if="mensaje" role="alert">
                {{ mensaje }}
            </p>

            <p v-if="error" role="alert">
                {{ error }}
            </p>
        </form>

        <p>
            ¿Ya tienes cuenta? 
            <RouterLink to="/login">Iniciar sesion</RouterLink>
            <RouterLink to="/registro-alumno">Soy alumno</RouterLink>
        </p>
    </main>
</template>