import { api } from './api.js'


const crear_evaluacion = async (datos) => {
    return (await api.post('/profesor/grupos', datos)).data
};


const listar_evaluaciones_profesor = async () => {
    return (await api.get('/profesor/evaluacion')).data 
};


const listar_evaluaciones_alumno = async () => {
    return (await api.get('/alumno/evaluaciones')).data
};


const listar_resultado_alumno = async () => {
    return (await api.get('/alumno/resultado')).data
}

export {
    crear_evaluacion,
    listar_evaluaciones_profesor,
    listar_evaluaciones_alumno,
    listar_resultado_alumno
};