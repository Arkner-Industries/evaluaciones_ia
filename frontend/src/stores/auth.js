import { defineStore } from 'pinia'
// Usuarios falsos, solo para desarrollar. Se borran al conectar el backend.
const USUARIOS_PRUEBA = [
  { nombre_usuario: 'profe', contrasena: '1234', rol: 'profesor' },
  { nombre_usuario: 'alumno', contrasena: '1234', rol: 'alumno' }
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null')
  }),
  getters: {
    estaAutenticado: (state) => !!state.token
  },
  actions: {
    async login(nombre_usuario, contrasena) {
      // simula la espera de una petición real
      await new Promise((r) => setTimeout(r, 500))

      const encontrado = USUARIOS_PRUEBA.find(
        (u) => u.nombre_usuario === nombre_usuario && u.contrasena === contrasena
      )
      if (!encontrado) {
        throw new Error('Credenciales incorrectas')
      }

      this.token = 'token-falso'
      this.usuario = { nombre_usuario: encontrado.nombre_usuario, rol: encontrado.rol }
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