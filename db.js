import { createPool } from 'mysql2/promise'; // Importa la función createPool desde mysql2/promise para crear un pool de conexiones a la base de datos
import dotenv from 'dotenv';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Crea el pool de conexiones con tus datos del .env, un pool es un conjunto de conexiones a la base de ..
// ..datos que se reutilizan para mejorar el rendimiento y evitar abrir y cerrar conexiones constantemente
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Permite que las conexiones esperen si no hay disponibles
    connectionLimit: 50, // Aumenta el límite de conexiones según tus necesidades
    queueLimit: 20 // Aumenta el límite de la cola según tus necesidades
});

// Exporta el pool como valor por defecto
export default pool;