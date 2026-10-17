import express from "express";
import { crear_alumno } from "../controladores/controlador_alumno.js";

const router = express.Router();


router.post("/registro", crear_alumno);


export default router;