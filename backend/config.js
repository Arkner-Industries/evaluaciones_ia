import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import ruta_profesor from './rutas/ruta_profesor.js';
import ruta_alumno from './rutas/ruta_alumno.js';
import ruta_auth from './rutas/ruta_auth.js';

dotenv.config();
const servidor = express();

servidor.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));


const pool = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


servidor.use(express.json());
servidor.use("/profesor", ruta_profesor);
servidor.use("/alumno", ruta_alumno);
servidor.use("/auth", ruta_auth);



export {
    servidor
};