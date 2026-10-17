import express from "express";
import { login } from "../controladores/controlador_auth.js"

const router = express.Router();


router.post("/login", login);


export default router;