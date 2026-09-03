// usuarios.js
import pool from '../db.js' // Ajusta la ruta a tu archivo de configuración de BD

/**
 * Crear un usuario
 * @param {Object} datos - { nombre, apellido, usuario, contrasena, tipo }
 * @returns {Promise<Object>} - Resultado de la inserción
 */
const crear_usuario = async (datos) => {
    const { usuario, contrasena, email, rol } = datos;
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(
            `INSERT INTO usuario (usuario, contrasena, email, rol)
             VALUES (?, ?, ?, ?)`,
            [usuario, contrasena, email, rol]
        );
        return result; // contiene insertId, affectedRows, etc.
    } finally {
        connection.release();
    }
};

/**
 * Borrar un usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
const borrar_usuario = async (id) => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(
            'DELETE FROM Usuario WHERE id = ?',
            [id]
        );
        return result; // contiene affectedRows
    } finally {
        connection.release();
    }
};

/**
 * Actualizar un usuario por ID
 * @param {number} id - ID del usuario
 * @param {Object} datos - Campos a actualizar (ej: { nombre, apellido, usuario, contrasena, tipo })
 * @returns {Promise<Object>} - Resultado de la actualización
 */
const actualizar_usuario = async (id, datos) => {
    const connection = await pool.getConnection();
    try {
        // Construir dinámicamente la consulta SET
        const keys = Object.keys(datos);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => datos[key]);
        values.push(id); // para el WHERE

        const query = `UPDATE Usuario SET ${setClause} WHERE id = ?`;
        const [result] = await connection.query(query, values);
        return result; // contiene affectedRows
    } finally {
        connection.release();
    }
};


export {
    crear_usuario,
    actualizar_usuario,
    borrar_usuario
}