import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    if (!nombre_usuario || !contrasena) {
        return res.status(400).json({
            mensaje: "Faltan campos obligatorios"
        });
    }

    try{
        const [filas] = await pool.execute(
            'SELECT id, nombre_usuario, contrasena, rol FROM usuario WHERE nombre_usuario = ? OR email = ?',
            [nombre_usuario, nombre_usuario]
        );

        if (filas.length === 0) {
            return res.status(401).json({ mensaje: "Credencial invalida" });
        }

        const usuario = filas[0]

        const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!coincide) {
            return res.status(401).json({ mensaje: "Credencial incorrecta1" })
        }

        const token = jwt.sign(
            { id: usuario.id, rol:  usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.status(200).json({
            mensaje: "Inicio de sesion correcto",
            token,
            usuario: {
                id: usuario.id,
                nombre_usuario: usuario.nombre_usuario,
                rol: usuario.rol
            }
        });

    } catch (error){
        console.error("Error al iniciar sesion", error);
        return res.status(500).json({ mensaje: "Error interno al iniciar sesion" });
    }
};

export {
    login
};