// configuraciones del servidor
import express from 'express';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import ruta_profesor from './rutas/ruta_profesor.js';

config();
const servidor = express();


const pool = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


servidor.use(express.json());
servidor.use("/profesor", ruta_profesor);

const puerto = process.env.PORT || 4000;
servidor.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${puerto}`);
});

export {
    servidor
};