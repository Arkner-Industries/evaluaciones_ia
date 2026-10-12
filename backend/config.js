// configuraciones del servidor
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import ruta_profesor from './rutas/ruta_profesor.js';

dotenv.config();
const servidor = express();

servidor.use(cors({
    origin: 'http://localhost:5173'
}))

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