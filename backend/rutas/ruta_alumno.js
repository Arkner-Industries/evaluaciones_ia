import express from "express";
import { crear_alumno } from "../controladores/controlador_alumno.js";
import { listar_grupos_alumno, unirse_a_grupo } from "../controladores/controlador_grupo.js";
import { 
    listar_evaluacion_alumno, 
    listar_resultado_alumno, 
    obtener_evaluacion_alumno, 
    entregar_evaluacion 
} from "../controladores/controlador_evaluacion.js";
import { verificar_token, verificar_rol } from "../middleware/auth.js"


const router = express.Router();

const solo_alumno = [verificar_token, verificar_rol("alumno")];

router.post("/registro", crear_alumno);

router.get("/grupo", solo_alumno, listar_grupos_alumno)

router.post("/grupos/unirse", solo_alumno, unirse_a_grupo);

router.get("/evaluaciones", solo_alumno, listar_evaluacion_alumno);

router.get("/evaluaciones/:id", solo_alumno, obtener_evaluacion_alumno);

router.post("/evaluaciones/:id/entregar", solo_alumno, entregar_evaluacion);

router.get("/resultados", solo_alumno, listar_resultado_alumno);

export default router;