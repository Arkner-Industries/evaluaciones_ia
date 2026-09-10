import { router } from "./config.js"
import { crear_usuario, actualizar_usuario, borrar_usuario } from "./controladores/usuarios.js"
// estoy cansado jefe, y recuerden hijos de su fruta madre usar minusculas siempre que no sea necesario

router.get("/",(req,res)=>{
    res.send("ok")
})

// Crear usuario (post)
router.post("/usuarios", async (req, res) => { // async porque vamos a usar await dentro de la función
    try {

        const { usuario, contrasena, email, rol, nombre, apellido, materia } = req.body;
        if (!usuario || !contrasena || !email || !rol) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        // Validar que rol sea 'alumno' o 'profesor'
        if (!['alumno', 'profesor'].includes(rol)) {
            return res.status(400).json({ error: "Rol inválido" });
        }
        const resultado = await crear_usuario({ usuario, contrasena, email, rol, nombre, apellido, materia }); // await porque crear_usuario es una función asíncrona que devuelve una promesa
        res.status(201).json({ mensaje: "Usuario creado", id: resultado.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

// Actualizar usuario (PUT)
router.put("/usuarios/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id); // parseInt convierte el id de string a número, ya que los parámetros de la URL siempre son strings
        const datos = req.body; // { nombre, apellido, usuario, contrasena, tipo } (solo los que se quieran actualizar)
        if (Object.keys(datos).length === 0) { // === es para comparar tipo y valor, en este caso queremos asegurarnos de que el objeto no esté vacío
            return res.status(400).json({ error: "No se enviaron datos para actualizar" });
        }
        const resultado = await actualizar_usuario(id, datos);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ mensaje: "Usuario actualizado", affectedRows: resultado.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

// Borrar usuario (DELETE)
router.delete("/usuarios/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await borrar_usuario(id);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ mensaje: "Usuario eliminado", affectedRows: resultado.affectedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al borrar usuario" });
    }
});
