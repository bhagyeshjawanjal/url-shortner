import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

let connection;

try {
  connection = await mysql.createConnection(dbConfig);
  console.log("MySQL connected");
} catch (error) {
  console.error("Error connecting to database:", error);
}

export default connection;
