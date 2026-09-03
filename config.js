import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();


const router = express.Router();
const servidor = express();

servidor.use(express.json())
servidor.use(router)
servidor.listen(process.env.port)

const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

export {
    conexion,
    router,
    servidor
};