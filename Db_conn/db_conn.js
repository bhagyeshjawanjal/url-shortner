import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE) || 20,
  queueLimit: 0,
  enableKeepAlive: true,
};

const pool = mysql.createPool(dbConfig);

// createPool is lazy, so ping once at boot to surface bad credentials/host early.
pool.getConnection()
  .then((connection) => {
    console.log("MySQL pool ready");
    connection.release();
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

export default pool;
