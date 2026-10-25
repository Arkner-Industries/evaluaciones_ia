import { api } from './api'

const crear_grupo = async ({ nombre }) => {
    return (await api.post('/profesor/grupos', { nombre })).data
};


const listar_grupos_profesor = async () => {
    return (await api.get('/profesor/grupos')).data
};


const listar_grupo_alumno = async () => {
    return (await api.get('/alumno/grupos')).data
};


const unirse_a_agrupo = async (codigo) => {
    return (await api.post('/alumno/grupos/unirse', { codigo })).data
};


export {
    listar_grupos_profesor,
    listar_grupo_alumno,
    crear_grupo,
    unirse_a_agrupo
};