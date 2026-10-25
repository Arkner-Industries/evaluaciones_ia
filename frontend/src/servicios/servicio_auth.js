import { api } from './api.js'

const iniciar_sesion = async (nombre_usuario, contrasena) => {
    const { data } = await api.post('/auth/login', { nombre_usuario, contrasena })
    return data
};

const registrar_usuario = async (rol, datos) => {
    const { data } = await api.post(`/${rol}/registro`, datos)
    return data
};

export {
    iniciar_sesion,
    registrar_usuario
}