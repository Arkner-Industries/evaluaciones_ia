import { defineStore } from "pinia";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        usuario: JSON.parse(localStorage.getItem('usuario') || "null")
    }),

    getters:{
        esta_autenticado: (state) => !!state.token
    },

    actions: {
        async login(nombre_usuario, contrasena) {
            
            const respuesta = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre_usuario, contrasena })        
            })
        

            let datos = {}
            
            try {
                datos = await respuesta.json()
            } catch {
                throw new Error('servidor no responde')
            }
            
            if (!respuesta.ok) {
                throw new Error(datos.mensaje || 'Credencial no correcta')
            }

            this.token = datos.token
            this.usuario = datos.usuario
            localStorage.setItem('token', this.token)
            localStorage.setItem('usuario', JSON.stringify(this.usuario))
        },

        logout() {
            this.token = null
            this.usuario = null
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
        }
    }
})