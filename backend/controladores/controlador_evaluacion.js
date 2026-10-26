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
                ...fila,
                preguntas: Number(fila.preguntas),
                entregas: Number(fila.entregas)
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
};


const obtener_evaluacion_alumno = async (req, res) => {
    const id_evaluacion = Number(req.params.id);

    if (!Number.isInteger(id_evaluacion) || id_evaluacion <= 0) {
        return res.status(400).json({ mensaje: "Evaluación inválida" });
    }

    try {
        const id_alumno = await id_alumno_de(req.usuario.id);
        if (!id_alumno) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene un perfil de alumno" });
        }

        const [evaluaciones] = await pool.execute(
            `SELECT e.id, e.titulo, e.descripcion,
                DATE_FORMAT(e.fecha, '%Y-%m-%d') AS fecha,
                g.nombre_grupo AS grupo,
                ea.id AS id_entrega
            FROM evaluacion e
            JOIN grupo g ON g.id = e.id_grupo
            JOIN grupo_alumno ga ON ga.id_grupo = g.id AND ga.id_alumno = ?
            LEFT JOIN evaluacion_alumno ea ON ea.id_evaluacion = e.id AND ea.id_alumno = ga.id_alumno
            WHERE e.id = ?`,
            [id_alumno, id_evaluacion]
        );

        if (evaluaciones.length === 0) {
            return res.status(404).json({ mensaje: "La evaluacion no existe o no es de tus grupos" });
        }
        if (evaluaciones[0].id_entrega !== null) {
            return res.status(409).json({ mensaje: "Ya entregaste esta evaluacion" });
        }

        const [preguntas] = await pool.execute(
            "SELECT id, pregunta FROM preguntas WHERE id_evaluacion = ? ORDER BY id",
            [id_evaluacion]
        );

        const { id_entrega, ...evaluacion } = evaluaciones[0];
        return res.status(200).json({ ...evaluacion, preguntas });

    } catch (error) {
        console.error("Error al obtener la evaluacion del alumno", error);
        return res.status(500).json({ mensaje: "Error interno al obtener la evaluacion" });
    }
};


const entregar_evaluacion = async (req, res) => {
    const id_evaluacion = Number(req.params.id);
    const { respuestas } = req.body || {};

    if (!Number.isInteger(id_evaluacion) || id_evaluacion <= 0) {
        return res.status(400).json({ mensaje: "Evaluación invalida" });
    }
    if (
        !Array.isArray(respuestas) || respuestas.length === 0 ||
        !respuestas.every((r) => Number.isInteger(Number(r?.id_pregunta)) && typeof r?.respuesta === "string")
    ) {
        return res.status(400).json({ mensaje: "Las respuestas no tienen el formato correcto" });
    }

    const conexion = await pool.getConnection();
    let transaccion_iniciada = false;

    try {
        const id_alumno = await id_alumno_de(req.usuario.id);
        if (!id_alumno) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene un perfil de alumno" });
        }

        const [evaluaciones] = await conexion.execute(
            `SELECT e.id
            FROM evaluacion e
            JOIN grupo_alumno ga ON ga.id_grupo = e.id_grupo
            WHERE e.id = ? AND ga.id_alumno = ?`,
            [id_evaluacion, id_alumno]
        );
        if (evaluaciones.length === 0) {
            return res.status(404).json({ mensaje: "La evaluación no existe o no es de tus grupos" });
        }

        const [preguntas] = await conexion.execute(
            "SELECT id FROM preguntas WHERE id_evaluacion = ?",
            [id_evaluacion]
        );
        const ids_validos = preguntas.map((p) => p.id);
        const ids_enviados = respuestas.map((r) => Number(r.id_pregunta));
        const completas =
            ids_validos.length === ids_enviados.length &&
            ids_validos.every((id) => ids_enviados.includes(id));

        if (!completas) {
            return res.status(400).json({ mensaje: "Tenés que responder todas las preguntas de la evaluacion" });
        }

        await conexion.beginTransaction();
        transaccion_iniciada = true;

        const [entrega] = await conexion.execute(
            "INSERT INTO evaluacion_alumno (id_evaluacion, id_alumno, fecha) VALUES (?,?,CURDATE())",
            [id_evaluacion, id_alumno]
        );

        for (const r of respuestas) {
            await conexion.execute(
                "INSERT INTO respuestas (id_evaluacion_alumno, id_pregunta, respuesta) VALUES (?,?,?)",
                [entrega.insertId, Number(r.id_pregunta), r.respuesta.trim()]
            );
        }

        await conexion.commit();
        transaccion_iniciada = false;

        return res.status(201).json({ mensaje: "Evaluación entregada", id: entrega.insertId });

    } catch (error) {
        if (transaccion_iniciada) {
            await conexion.rollback();
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ mensaje: "Ya entregaste esta evaluacion" });
        }

        console.error("Error al entregar la evaluacion", error);
        return res.status(500).json({ mensaje: "Error interno al entregar la evaluacion" });

    } finally {
        conexion.release();
    }
};


const listar_entregas_profesor = async (req, res) => {
    const id_evaluacion = Number(req.params.id);

    if (!Number.isInteger(id_evaluacion) || id_evaluacion <= 0) {
        return res.status(400).json({ mensaje: "Evaluación invalida" });
    }

    try {
        const id_profesor = await id_profesor_de(req.usuario.id);
        if (!id_profesor) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene un perfil de profesor" });
        }

        // La evaluación tiene que ser del profesor
        const [evaluaciones] = await pool.execute(
            "SELECT id, titulo FROM evaluacion WHERE id = ? AND id_profesor = ?",
            [id_evaluacion, id_profesor]
        );
        if (evaluaciones.length === 0) {
            return res.status(404).json({ mensaje: "La evaluacion no existe o no es tuya" });
        }

        const [filas] = await pool.execute(
            `SELECT ea.id, CONCAT(a.nombre, ' ', a.apellido) AS alumno,
                DATE_FORMAT(ea.fecha, '%Y-%m-%d') AS fecha, ea.nota
            FROM evaluacion_alumno ea
            JOIN alumno a ON a.id = ea.id_alumno
            WHERE ea.id_evaluacion = ?
            ORDER BY ea.id DESC`,
            [id_evaluacion]
        );

        return res.status(200).json({
            id: evaluaciones[0].id,
            titulo: evaluaciones[0].titulo,
            entregas: filas.map((fila) => {
                const nota = a_numero(fila.nota);
                return {
                    id: fila.id,
                    alumno: fila.alumno,
                    fecha: fila.fecha,
                    estado: estado_de(fila.id, nota),
                    nota
                };
            })
        });

    } catch (error) {
        console.error("Error al listar las entregas", error);
        return res.status(500).json({ mensaje: "Error interno al listar las entregas" });
    }
};


const obtener_entrega_profesor = async (req, res) => {
    const id_entrega = Number(req.params.id);

    if (!Number.isInteger(id_entrega) || id_entrega <= 0) {
        return res.status(400).json({ mensaje: "Entrega invalida" });
    }

    try {
        const id_profesor = await id_profesor_de(req.usuario.id);
        if (!id_profesor) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene un perfil de profesor" });
        }

        const [entregas] = await pool.execute(
            `SELECT ea.id, ea.nota, DATE_FORMAT(ea.fecha, '%Y-%m-%d') AS fecha,
                e.id AS id_evaluacion, e.titulo,
                CONCAT(a.nombre, ' ', a.apellido) AS alumno
            FROM evaluacion_alumno ea
            JOIN evaluacion e ON e.id = ea.id_evaluacion
            JOIN alumno a ON a.id = ea.id_alumno
            WHERE ea.id = ? AND e.id_profesor = ?`,
            [id_entrega, id_profesor]
        );
        if (entregas.length === 0) {
            return res.status(404).json({ mensaje: "La entrega no existe o no es de tus evaluaciones" });
        }

        const [respuestas] = await pool.execute(
            `SELECT r.id, p.pregunta, p.respuesta_correcta, r.respuesta,
                r.correccion_ia AS comentario, r.nota
            FROM respuestas r
            JOIN preguntas p ON p.id = r.id_pregunta
            WHERE r.id_evaluacion_alumno = ?
            ORDER BY r.id`,
            [id_entrega]
        );

        return res.status(200).json({
            ...entregas[0],
            nota: a_numero(entregas[0].nota),
            respuestas: respuestas.map((r) => ({ ...r, nota: a_numero(r.nota) }))
        });

    } catch (error) {
        console.error("Error al obtener la entrega", error);
        return res.status(500).json({ mensaje: "Error interno al obtener la entrega" });
    }
};


const corregir_entrega = async (req, res) => {
    const id_entrega = Number(req.params.id);
    const { correcciones } = req.body || {};

    if (!Number.isInteger(id_entrega) || id_entrega <= 0) {
        return res.status(400).json({ mensaje: "Entrega inválida" });
    }

    const nota_valida = (nota) =>
        nota !== "" && nota !== null && nota !== undefined &&
        Number.isFinite(Number(nota)) && Number(nota) >= 0 && Number(nota) <= 10;

    if (
        !Array.isArray(correcciones) || correcciones.length === 0 ||
        !correcciones.every((c) =>
            Number.isInteger(Number(c?.id_respuesta)) &&
            nota_valida(c?.nota) &&
            (c?.comentario === undefined || c?.comentario === null || typeof c?.comentario === "string")
        )
    ) {
        return res.status(400).json({ mensaje: "Cada respuesta necesita una nota entre 0 y 10" });
    }

    const conexion = await pool.getConnection();
    let transaccion_iniciada = false;

    try {
        const id_profesor = await id_profesor_de(req.usuario.id);
        if (!id_profesor) {
            return res.status(403).json({ mensaje: "Tu usuario no tiene un perfil de profesor" });
        }

        const [entregas] = await conexion.execute(
            `SELECT ea.id
            FROM evaluacion_alumno ea
            JOIN evaluacion e ON e.id = ea.id_evaluacion
            WHERE ea.id = ? AND e.id_profesor = ?`,
            [id_entrega, id_profesor]
        );
        if (entregas.length === 0) {
            return res.status(404).json({ mensaje: "La entrega no existe o no es de tus evaluaciones" });
        }

        const [respuestas] = await conexion.execute(
            "SELECT id FROM respuestas WHERE id_evaluacion_alumno = ?",
            [id_entrega]
        );
        const ids_validos = respuestas.map((r) => r.id);
        const ids_enviados = correcciones.map((c) => Number(c.id_respuesta));
        const completas =
            ids_validos.length === ids_enviados.length &&
            ids_validos.every((id) => ids_enviados.includes(id));

        if (!completas) {
            return res.status(400).json({ mensaje: "Tenes que corregir todas las respuestas de la entrega" });
        }

        await conexion.beginTransaction();
        transaccion_iniciada = true;

        let suma = 0;
        for (const c of correcciones) {
            const nota = Math.round(Number(c.nota) * 10) / 10;
            suma += nota;
            await conexion.execute(
                "UPDATE respuestas SET nota = ?, correccion_ia = ? WHERE id = ? AND id_evaluacion_alumno = ?",
                [nota, (c.comentario || "").trim(), Number(c.id_respuesta), id_entrega]
            );
        }

        const nota_final = Math.round((suma / correcciones.length) * 100) / 100;
        await conexion.execute(
            "UPDATE evaluacion_alumno SET nota = ? WHERE id = ?",
            [nota_final, id_entrega]
        );

        await conexion.commit();
        transaccion_iniciada = false;

        return res.status(200).json({ mensaje: "Correccion guardada", nota: nota_final });

    } catch (error) {
        if (transaccion_iniciada) {
            await conexion.rollback();
        }

        console.error("Error al corregir la entrega", error);
        return res.status(500).json({ mensaje: "Error interno al guardar la correccion" });

    } finally {
        conexion.release();
    }
};

export {
    crear_evaluacion,
    listar_evaluacion_profesor,
    listar_evaluacion_alumno,
    listar_resultado_alumno,
    obtener_evaluacion_alumno,
    entregar_evaluacion,
    listar_entregas_profesor,
    obtener_entrega_profesor,
    corregir_entrega
}