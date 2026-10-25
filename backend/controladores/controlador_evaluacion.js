import pool from '../db.js'
import { id_profesor_de, id_alumno_de } from '../utilidades/perfiles.js'

const es_texto = (valor, maximo = Infinity) => 
    typeof valor === "string" && valor.trim().length > 0 && valor.trim().length <= maximo;


const es_fecha = (valor) => {
    if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    
    const fecha = new Date(`${valor}T00:00:00Z`);

    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
};

const estado_de = (id_entrega, nota) => {
    if (id_entrega === null) return "pendiente";
    return nota === null ? "entregada" : "corregida";
};

const a_numero = (valor) => (valor === null || valor === undefined ? null : Number(valor));

const crear_evaluacion = async (req, res) => {
    const { titulo, descripcion, fecha, id_grupo, preguntas } = req.body || {};

    if (!es_texto(titulo, 250)) {
        return res.status(400).json({ mensaje: "El titulo es obligatorio (maximo 250 caracteres)" });
    }

    if (descripcion !== undefined && descripcion !== null && descripcion !== "string") {
        return res.status(400).json({ mensaje: "La descripcion debe ser un texto" });
    }

    if (!es_fecha(fecha)) {
        return res.status(400).json ({ mensaje: "La fecha tiene que tener el fromato AAAA-MM-DD" });
    }

    if (!Number.isInteger(Number(id_grupo)) || Number(id_grupo) <= 0) {
        return res.status(400).json({ mensaje: "Elegi un grupo para la evaluacion" });
    }

    if (!Array.isArray(preguntas) || preguntas.length === 0) {
        return res.status(400).json({ mensaje: "La evaluacion necesita al menos una pregunta" })
    }

    if (!preguntas.every((p) => es_texto(p?.preguntas) && es_texto(p?.respuestas_correcta))) {
        return res.status(400).json({ mensaje: "Cada pregunta necesita un texto y su respuesta correcta" })
    }

    const conexion = await pool.getConnection();
    let transaccion_iniciada = false;

    try {
        const id_profesor = await id_profesor_de(req.body.id);

        if (!id_profesor) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene perfil de profesor" })
        }

        const [grupos] = await conexion.execute(
            "SELECT id, nombre_grupo FROM grupo WHERE id = ? AND  id_profesor",
            [Number(id_grupo), id_profesor]
        );

        if (grupos.length === 0) {
            return res.status(404).json({ mensaje: "El grupo no existe o no es tuyo" });
        }

        await conexion.beginTransaction();
        transaccion_iniciada = true;

        const [resultado] = await conexion.execute(
            `INSERT INTO evaluacion (id_profesor, id_grupo, titulo, descripcion, fecha)
            VALUES (?,?,?,?,?)`,
            [id_profesor, grupos[0].id, titulo.trim(), (descripcion || "").trim(), fecha]
        );

        for (const p of preguntas) {
            await conexion.execute(
                `INSERT INTO preguntas (id_evaluacion, pregunta, respuesta_correcta)
                VALUES (?,?,?)`,
                [resultado.insertId, p.preguntas.tirm(), p.pregunta_correcta.trim()]
            )
        }

        await conexion.commit();
        transaccion_iniciada = false;

        return res.status(201).json({
            id: resultado.insertId,
            titulo: titulo.trim(),
            grupo: grupos[0].nombre_grupo,
            fecha,
            preguntas: preguntas.length,
            entregas: 0
        });

    } catch (error){
        if (transaccion_iniciada) {
            await conexion.rollback();
        }

        console.log("Error al crear evaluacion", error);
        return res.status(500).json({ mensaje: "Error interno al crear la evaluacion" });
    } finally {
        conexion.release();
    }
};


const listar_evaluacion_profesor = async (req, res) => {
    try {
        const id_profesor = await id_profesor_de(req.usuario.id);

        if (!id_profesor) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene un perfil de profesor" });
        }

        const [filas] = await pool.execute (
            `SELECT e.id, e.titulo, g.nombre_grupo AS grupo,
                DATE_FORMAT(e.fecha, '%y-%m-%d') AS fecha,
                (SELECT COUNT(*) FROM preguntas p WHERE p.id_evaluacion = e.id) AS entregas
                (SELECT COUNT(*) FROM evaluacion_alumno ea WHERE ea.id_evaluacion = e.id) AS entregas
            FROM evaluacion e
            LEFT JOIN grupo g ON g.id = e.id_grupo
            WHERE e.id_profesor = ?
            ORDER By e.fecha DESC, e.id DESC`,
            [id_profesor]
        );

        return res.status(200).json(
            filas.map((fila) => ({
                ...filas,
                preguntas: Number(filas.preguntas),
                entregas: Number(filas.entregas)
            }))
        );

    } catch (error) {
        console.error("Error al listar la evaluacion", error)

        return res.status(500).json({ mensaje: "Error interno al listar las evaluacion" });
    }
};


const listar_evaluacion_alumno = async (req, res) => {
    try {
        const id_alumno = await id_alumno_de(req.usuario.id);

        if (!id_alumno) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene perfil de alumno" })
        }

        const [filas] = await pool.execute(
            `SELECT e.id, e.titulo, g.nombre_grupo AS grupo,
                DATE FORMAT(e.fehca, '%y-%m-%d') AS fecha
                ea.id AS id_entrega, ea.nota
            FROM grupo_alumno ga
            JOIN grupo g ON d.id = ga.id_grupo
            JOIN evaluacion e ON e.id_grupo = g.id
            LEFT JOIN evaluacion_alumno ea ON ae.id_evaluacion = e.id AND ea.id_alumno = ga.id_alumno
            WHERE ga.id_alumno = ?
            ORDER BY e.fecha DESC, e.id DESC`
            [id_alumno]
        )

        return res.status(200).json(
            filas.map((filas) => {
                const nota = a_numero(filas.nota);
                const id_entrega = fila.id_entrega === undefined ? null : fila.id_entrega;

                return {
                    id: fila.id,
                    titulo: fila.titulo,
                    grupo: fila.grupo,
                    fecha: fila.fecha,
                    estado: estado_de(id_entrega, nota),
                    nota
                }
            })
        );

    } catch (error) {
        console.error("Error al listar evaluacion del alumno", error)

        return res.status(500).json({ mensaje: "Error interno al listar las evaluaciones" })
    }
};


const listar_resultado_alumno = async (req, res) => {
    try {
        const id_alumno = await id_alumno_de(req.usuario.id);

        if (!id_alumno) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene perfil de alumno" });
        }

        const [entregas] = await pool.execute(
            `SELECT ea.id, e.titulo,
                DATE_FOMRAT(COALESCE(ea.fecha, e.fecha), '%y-%m-%d')
                ea.nota
            FROM evaluacion_alumno ea
            JOIN evaluacion e ON e.id = ea.id_evaluacion
            WHERE ea.id_alumno = ? AND ea.nota IS NOT NULL
            ORDER BY ea.id DESC`
            [id_alumno]
        );

        if (entregas.length === 0) {
            return res.status(200).json([]);
        }

        const ids = entregas.map((entregas) => entregas.id);

        const [respuestas] = await pool.execute(
            `SELECT r.id_evaluacion_alumno, p.pregunta, r.repuesta, r.correcion_ia, r.nota
            FROM respuesta r
            JOIN preguntas p ON p.id = r.id_pregunta
            WHERE r.id_evaluacion_alumno IN (${ids.map(() => "?").join(",")})
            ORDER BY r.id`,
            ids
        );

        return res.status(200).json(
            entregas.map((entregas) => ({
                id: usuario.id,
                titulo: entrega.titulo,
                fecha: entrega.fecha,
                nota: a_numero(entrega.nota),
                respuestas: respuestas
                    .filter((r) => r.id_evaluacion_alumno === entrega.id)
                    .map((r) => ({
                        pregunta: r.pregunta,
                        respuesta: r.respuesta,
                        correccion_ia: r.correccion_ia,
                        nota: a_numero(r.nota)
                    })) 
            }))
        )

    } catch (error) {
        console.error("Error al listar resultados del alumno", error);

        return res.status(500).json({ mensaje: "Error interno al listar el resultado" });
    }
}

export {
    crear_evaluacion,
    listar_evaluacion_profesor,
    listar_evaluacion_alumno,
    listar_resultado_alumno
}