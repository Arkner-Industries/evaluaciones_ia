import pool from "../backend/db.js";
import bcrypt from "bcrypt";

// Función para crear un profesor
const crear_profesor = async (req, res) => {
    const { usuario, contrasena, email, nombre, apellido } = req.body;

    if (!usuario || !contrasena || !email || !nombre || !apellido) {
        return res.status(400).json({
            mensaje: "Faltan campos obligatorios"
        })
    }

    const conexion = await pool.getConnection();

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
        
        const hash = await bcrypt.hash (contrsena, 10);

        await conexion.beginTransaction();

        const [resultado_usuario] = await conexion.execute(
            `ISERT INTO usuario (nombre_usuario, contrasena, email, rol) 
            VALUES(?,?,?, 'profesor')`,
            [nombre_usuario, hash, email]
        );

        await conexion.commit();

        return res.status(201).json({
            mensaje: 'Profesor creado correctamente'
        });

    } catch (error) {
        await conexion.rollback();

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