import { pool } from "../../infrastructure/database/connection.js";

export const findUserByUsername = async (username) => {
  const [rows] = await pool.execute(
    `SELECT
       id,
       name,
       username,
       email,
       password_hash,
       role,
       is_active
     FROM users
     WHERE username = ?
       AND is_active = 1
     LIMIT 1`,
    [username]
  );

  return rows[0] || null;
};
