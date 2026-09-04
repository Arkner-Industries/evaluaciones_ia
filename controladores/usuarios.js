import pool from '../db.js' // Ajusta la ruta a tu archivo de configuración de BD

// Función para crear un usuario
const crear_usuario = async (datos) => {
    const { usuario, contrasena, email, rol } = datos;
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(
            `INSERT INTO usuario (usuario, contrasena, email, rol)
             VALUES (?, ?, ?, ?)`,
            [usuario, contrasena, email, rol]
        );
        return result;
    } finally {
        connection.release();// libera la conexión de vuelta al pool
    }
};

// Crea la función borrar_usuario que recibe un id y elimina el usuario correspondiente
const borrar_usuario = async (id) => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(
            'DELETE FROM usuario WHERE id = ?',
            [id]
        );
        return result; // contiene affectedRows
    } finally {
        connection.release(); 
    }
};

// Crea la función actualizar_usuario que recibe un id y un objeto con los datos a actualizar
const actualizar_usuario = async (id, datos) => {
    const connection = await pool.getConnection();
    try {
        // Construir dinámicamente la consulta SET
        const keys = Object.keys(datos);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => datos[key]);
        values.push(id); // para el WHERE

        const query = `UPDATE usuario SET ${setClause} WHERE id = ?`;
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