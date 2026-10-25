import { defineStore } from "pinia";
import { iniciar_sesion } from "../servicios/servicio_auth"; 
import { mensaje_de_error } from "../servicios/api";

const leer_usuario_guardado = () => {
    try {
        return JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch {
        return null
    }
}

const useAuthStore = defineStore('auth', 
{ 
    state: () => ({
        token: localStorage.getItem('token') || null,
        usuario: leer_usuario_guardado()
    }),

    getters:{
        esta_autenticado: (state) => !!state.token && !!state.usuario,
        es_profesor: (state) => state.usuario?.rol == 'profesor',
        es_alumno: (state) => state.usuario?.rol == 'alumno'
    },

    actions: {
        async login(nombre_usuario, contrasena) {
            
            let datos

            try {
                datos = await iniciar_sesion(nombre_usuario, contrasena)
            } catch (err) {
                
                throw new Error(mensaje_de_error(err, 'Credencial incorrecta'))
            }

            this.token = datos.token
            this.usuario = datos.usuario
            localStorage.removeItem('token', this.token)
            localStorage.removeItem('usuario', JSON.stringify(this.usuario))
        },

        logout() {
            this.token = null
            this.usuario = null
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
        }
    }
})

export {
    useAuthStore
};