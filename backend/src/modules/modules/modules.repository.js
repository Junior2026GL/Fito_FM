import { pool } from "../../infrastructure/database/connection.js";

export const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT id, \`key\`, label, description FROM modules ORDER BY id`
  );
  return rows;
};

export const findAllKeys = async () => {
  const rows = await findAll();
  return rows.map((m) => m.key);
};
