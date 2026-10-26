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


const obtener_evaluacion_alumno = async (id) => {
    return (await api.get(`/alumno/evaluaciones/${id}`)).data
}


const entregar_evaluacion = async (id, respuesta) => {
    return (await api.post(`/alumno/evaluaciones/${id}/entregar`, { respuesta })).data
}


const listar_entregas_evaluacion = async (id_evaluacion) => {
  return (await api.get(`/profesor/evaluaciones/${id_evaluacion}/entregas`)).data
}


const obtener_entrega = async (id_entrega) => {
  return (await api.get(`/profesor/entregas/${id_entrega}`)).data
}


const corregir_entrega = async (id_entrega, correcciones) => {
  return (await api.put(`/profesor/entregas/${id_entrega}/correccion`, { correcciones })).data
}

export {
    crear_evaluacion,
    listar_evaluaciones_profesor,
    listar_evaluaciones_alumno,
    listar_resultado_alumno,
    obtener_evaluacion_alumno,
    entregar_evaluacion,
    listar_entregas_evaluacion,
    obtener_entrega,
    corregir_entrega
};