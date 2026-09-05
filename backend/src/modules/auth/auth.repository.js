import { pool } from "../../infrastructure/database/connection.js";

export const findUserByUsername = async (username) => {
  const [rows] = await pool.execute(
    `SELECT
       u.id,
       u.name,
       u.username,
       u.email,
       u.password_hash,
       u.role,
       u.is_active,
       COALESCE(
         (SELECT JSON_ARRAYAGG(m.\`key\`)
          FROM user_modules um
          JOIN modules m ON m.id = um.module_id
          WHERE um.user_id = u.id),
         JSON_ARRAY()
       ) AS modules
     FROM users u
     WHERE u.username = ?
       AND u.is_active = 1
     LIMIT 1`,
    [username]
  );

  return rows[0] || null;
};
