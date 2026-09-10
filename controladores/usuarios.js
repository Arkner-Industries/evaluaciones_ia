import { Connection } from 'mysql2';
import pool from '../db.js' // Ajusta la ruta a tu archivo de configuración de BD

// Función para crear un usuario
const crear_usuario = async (datos) => {
    const { usuario, contrasena, email, rol, nombre, apellido, materia } = datos;
    const connection = await pool.getConnection(); // Obtiene una conexión del pool
    try { // try es para intentar ejecutar el código y catch es para capturar errores si los hay
        await connection.beginTransaction(); // Inicia una transacción para asegurar que todas las operaciones se completen correctamente
        const [result] = await connection.query(
            `INSERT INTO usuario (usuario, contrasena, email, rol)
             VALUES (?, ?, ?, ?)`,
            [usuario, contrasena, email, rol]
        );
        const id_usuario = result.insertId; // Obtiene el id del usuario recién creado
            if (rol === 'alumno') {
                await connection.query(
                    `INSERT INTO alumno (nombre, apellido, id_usuario)
                     VALUES (?, ?, ?)`,
                    [nombre, apellido, id_usuario]
                );
            } 
            else if (rol === 'profesor') {
                await connection.query(
                    `INSERT INTO profesor (nombre, apellido, materia, id_usuario)
                     VALUES (?, ?, ?, ?)`,
                    [nombre, apellido, materia, id_usuario]
                );
            }
            await connection.commit(); // Confirma la transacción si todo salió bien
            return id_usuario; // Devuelve el id del usuario creado
    } catch (error) {
        await connection.rollback(); // Revierte la transacción si hubo un error
        throw error; // Lanza el error para que pueda ser manejado por quien llame a la función
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