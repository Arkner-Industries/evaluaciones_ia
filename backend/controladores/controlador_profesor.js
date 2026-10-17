import pool from "../db.js";
import bcrypt from "bcrypt";

// Función para crear un profesor
const crear_profesor = async (req, res) => {
    const { nombre_usuario, contrasena, email, nombre, apellido } = req.body;

    if (!nombre_usuario || !contrasena || !email || !nombre || !apellido) {
        return res.status(400).json({
            mensaje: "Faltan campos obligatorios"
        })
    }

    const conexion = await pool.getConnection();
    let transaccion_iniciada = false;

    try {
        const [usuario_existente] = await conexion.execute(
            'SELECT id FROM usuario WHERE nombre_usuario = ? OR email = ?',
            [nombre_usuario, email]
        );
        
        if (usuario_existente.length > 0) {
            return res.status(409).json({
                mensaje: 'El usuario o el correo ya existen'
            });
        }
        
        const hash = await bcrypt.hash (contrasena, 10);

        await conexion.beginTransaction();
        transaccion_iniciada = true;

        const [resultado_usuario] = await conexion.execute(
            `INSERT INTO usuario (nombre_usuario, contrasena, email, rol) 
            VALUES(?,?,?, 'profesor')`,
            [nombre_usuario, hash, email]
        );

        const id_usuario = resultado_usuario.insertId;

        await conexion.execute(
            'INSERT INTO profesor (nombre, apellido, id_usuario) VALUES (?,?,?)',
            [nombre, apellido, id_usuario]
        );

        await conexion.commit();
        transaccion_iniciada = false;

        return res.status(201).json({
            mensaje: 'Profesor creado correctamente',
            id_usuario: id_usuario
        });

    } catch (error) {
        if (transaccion_iniciada) {
            await conexion.rollback();
        }
        
        console.error("Error al crear profesor",error);

        return res.status(500).json({
            mensaje: 'Error interno al crear profesor'
        });

    } finally {
        conexion.release();
    }
    
};

export {
    crear_profesor
};