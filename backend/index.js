import { servidor } from './config.js';
import './rutas/ruta_profesor.js';

servidor.get("/", (req,res)=>{
    res.send("Bienvenido a la API de evaluaciones IA")
});