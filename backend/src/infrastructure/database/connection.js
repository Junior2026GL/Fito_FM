import mysql from "mysql2/promise";
import { env } from "../../config/env.js";

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z"
});

export const testDatabaseConnection = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("Conexión a MySQL establecida");
  } finally {
    connection.release();
  }
};
