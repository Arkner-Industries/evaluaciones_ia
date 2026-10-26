import express from "express";
import { crear_profesor } from "../controladores/controlador_profesor.js";
import { crear_grupo, listar_grupos_profesor } from "../controladores/controlador_grupo.js";
import { 
    crear_evaluacion, 
    listar_evaluacion_profesor,
    listar_entregas_profesor,
    obtener_entrega_profesor,
    corregir_entrega
} from "../controladores/controlador_evaluacion.js";
import { verificar_rol, verificar_token } from "../middleware/auth.js";


const router = express.Router();

const solo_profesor = [verificar_token, verificar_rol("profesor")]


router.post("/registro", crear_profesor);

router.get("/grupos", solo_profesor, listar_grupos_profesor);

router.post("/grupos", solo_profesor, crear_grupo);

router.get("/evaluaciones", solo_profesor, listar_evaluacion_profesor);

router.post("/evaluaciones", solo_profesor, crear_evaluacion);

router.get("/evaluaciones/:id/entregas", solo_profesor, listar_entregas_profesor);

router.get("/entregas/:id", solo_profesor, obtener_entrega_profesor);

router.put("/entregas/:id/correccion", solo_profesor, corregir_entrega);

export default router;