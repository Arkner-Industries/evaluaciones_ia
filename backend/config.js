// configuraciones del servidor y la base de datos
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const servidor = express();

servidor.use(express.json())
servidor.use(router)
servidor.listen(process.env.port)


export {
    router,
    servidor
};