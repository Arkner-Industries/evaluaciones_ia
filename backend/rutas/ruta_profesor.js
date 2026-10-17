import express from "express";
import { crear_profesor } from "../controladores/controlador_profesor.js";

const router = express.Router();


router.post("/registro", crear_profesor);


export default router;