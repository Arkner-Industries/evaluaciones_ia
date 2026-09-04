import { router } from "./config.js"
import { crear_usuario, actualizar_usuario, borrar_usuario } from "./controladores/usuarios.js"

router.get("/",(req,res)=>{
    res.send("ok")
})

router.post("/registro", async (req, res) => {
    try {
        const { usuario, contrasena, email, rol } = req.body;
        if (!usuario || !contrasena || !email || !rol) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        // Validar que rol sea 'alumno' o 'profesor'
        if (!['alumno', 'profesor'].includes(rol)) {
            return res.status(400).json({ error: "Rol inválido" });
        }
        const resultado = await crear_usuario({ usuario, contrasena, email, rol });
        res.status(201).json({ mensaje: "Usuario creado", id: resultado.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});
