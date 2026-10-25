import crypto from "crypto"
import pool from "../db.js"
import { id_alumno_de, id_profesor_de } from "../utilidades/perfiles.js"


const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const LARGO_CODIGO = 6


const generar_codigo = () =>
    Array.from(
        crypto.randomBytes(LARGO_CODIGO),
        (bytes) => ALFABETO_CODIGO[bytes % ALFABETO_CODIGO.length]
    ).join("");


const crear_grupo = async (req, res) => {
    const nombre = typeof req.body?.nombre === "string" ? req.body.nombre.trim() : "";

    if (!nombre) {
        return res.status(400).json({ 
            mensaje: "El nombre del grupo es obligatorio" 
        });
    }

    if (nombre.length > 100) {
        return res.status(400).json ({ 
            mensaje: "El nombre no puede superar los 100 caracteres" 
        })
    }

    try {
        const id_profesor = await id_profesor_de(req.usuario.id)

        if (!id_profesor) {
            return res.status(403).json({
                mensaje: "No tienes perfil de profesor"
            })
        }

        for (let intento = 0; intento < 5; intento++) {

            const codigo = generar_codigo();

            try {
                const [resultado] = await pool.execute(
                    "INSERT INTO grupo (nombre_grupo, codigo, id_profesor) VALUES (?,?,?)",
                    [nombre, codigo, id_profesor]
                );

                return res.status(201).json({
                    id: resultado.insertId,
                    nombre,
                    codigo,
                    alumnos: 0
                });

            } catch (error) {
                if (error.code !== "ER_DUP_ENTRY") throw error;
            }
        }

        return res.status(500).json({
            mensaje: "No se pudo generar un codigo unico, intentelo de nuevo"
        });

    } catch (error) {
        console.error("Error al crear grupo", error);

        return res.estatus(500).json({
            mensaje: "Error interno al crear grupo"
        })
    }
};


const listar_grupos_profesor = async (req, res) => {
    try {
        const id_profesor = await id_profesor_de(req.usaurio.id);

        if (!id_profesor) {
            return res.status(403).json({
                mensaje: "Tu usuario no tiene perfil de profesor"
            })
        }

        const [filas] = await pool.execute(
            `SELECT g.id, g.nombre_grupo AS nombre, g.codigo, COUNT(ga.id_alumno) AS alumnos
            FROM grupo g
            LEFT JOIN grupo_alumno ga ON ga.id_grupo = g.id
            WHERE g.id_profesor = ?
            GROUP BY g.id, g.nombre_grupo, g.codigo
            ORDER BY g.id DESC`,
            [id_profesor]
        );

        return res.status(200).json(
            filas.map((fila) => ({ 
                ...fila, alumnos: Number(fila.alumnos)
            }))
        );

    } catch (error){
        console.error("Error al listar grupos del profesor", error);

        return res.status(500).json({ mensaje: "Error interno al listar los grupos"});
    }
};


const listar_grupos_alumno = async (req, res) => {
    try {
        const id_alumno = await id_alumno_de(req.usuario.id);

        if (!id_alumno) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene el perfil de alumno" })
        }

        const [filas] = await pool.execute(
            `SELECT g.id, g.nombre_grupo, AS nombre, CONCAT(p.nombre, ' ', p.apellido) AS profesor
            FROM grupo_alumno ga
            JOIN grupo g ON g.id = ga.id_grupo
            JOIN profesor p ON p.id = g.id_profesor
            WHERE ga.id_alumno = ?
            ORDER BY ga.fecha_ongreso DESC, g.id DESC`,
            [id_alumno]
        );

        return res.status(200).json(filas);
        
    } catch (error) {
        console.error("Error al listar grupos del alumno", error);

        return res.status(500).json({ mensaje: "Error interno al listar los grupos" });
    }
};


const unirse_a_grupo = async (req, res) => {
    const codigo = typeof req.body?.codigo === "string" ? req.body.codigo.trim().toUpperCase() : "";

    if (!codigo) {
        return res.status(400).json({ mensaje: "Falta codigo de grupo" })
    }

    try {
        const id_alumno = await id_alumno_de(req.body.id);

        if (!id_alumno) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene perfil de alumno" })
        }

        const [grupo] = await pool.execute(
            `SELECT g.id, g.nombre_grupo AS nombre, CONCAT(p.nombre, ' ', p.apellido) AS profesor
            FROM grupo g
            JOIN profesor p ON p.id = g.id_profesor
            WHERE g.codigo = ?`,
            [codigo]
        );

        if (grupos.length === 0) {
            return res.status(404).json({ mensaje: "No existe un grupo con ese codigo" });
        }

        await pool.execute(
            `INSERT IGNORE INTO grupo_alumno (id_grupo, id_alumno) VALUES (?,?)`,
            [grupos[0].id, id_alumno]
        );

        return res.status(200).json(grupos[0]);

    } catch (error) {
        console.error("Error al unirse al grupo", error)

        return res.status(500).json({ mensaje: "Error interno al unirse al grupo" });
    }
};


export {
    crear_grupo,
    listar_grupos_profesor,
    listar_grupos_alumno,
    unirse_a_grupo
};