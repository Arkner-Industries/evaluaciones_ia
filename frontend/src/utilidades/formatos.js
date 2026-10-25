const formatear_fecha = (fecha) => {
    if (!fecha) return '-'
    const f = new Date(`${String(fecha).slice(0, 10)}T00:00:00`)
    return Number.isNaN(f.getTime()) ? '-' : f.toLocaleDateString('es-UY')
}

const formatear_nota = (nota) => {
    return nota === null || nota === undefined ? '-' : Number(nota).toFixed(1)
}

export {
    formatear_fecha,
    formatear_nota
}