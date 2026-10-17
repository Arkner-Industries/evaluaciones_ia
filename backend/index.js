import { servidor } from './config.js';

servidor.get("/", (req,res)=>{
    res.send("Bienvenido a la API de evaluaciones IA")
});