import pool from "../db.js"


const id_profesor_de = async (id_usuario) => {
    const [filas] = await pool.execute(
        'SELEC id FROM profesor WHERE id_usuario = ?',
        [id_usuario]
    );

    return filas.length > 0 ? filas[0].id: null;
};

const id_alumno_de = async (id_usuario) => {
    const [filas] = await pool.execute(
        'SELECT id FROM alumno WHERE id_usuario = ?',
        [id_usuario]
    )

    return filas.length > 0 ? filas[0].id: null;
};


export {
    id_profesor_de,
    id_alumno_de
};