import { servidor } from './config.js';


servidor.get("/", (req,res)=>{
    res.send("Bienvenido a la API de evaluaciones IA")
});


servidor.use((req, res) => {
    res.status(404).json({ mensaje: "Ruta no encontrada" })
});


servidor.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ mensaje: "El cuerpo de la peticion no es un JSON valido" });
    }
    console.error("Error no controlado", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
});


const puerto = process.env.PORT || 4000;
servidor.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${puerto}`);
});