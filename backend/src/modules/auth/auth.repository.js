import { pool } from "../../infrastructure/database/connection.js";

const AUTH_USER_SELECT = `
  SELECT
    u.id,
    u.name,
    u.username,
    u.email,
    u.password_hash,
    u.role,
    u.is_active,
    u.token_version,
    COALESCE(
      (SELECT JSON_ARRAYAGG(m.\`key\`)
       FROM user_modules um
       JOIN modules m ON m.id = um.module_id
       WHERE um.user_id = u.id),
      JSON_ARRAY()
    ) AS modules
  FROM users u`;

export const findUserByUsername = async (username) => {
  const [rows] = await pool.execute(
    `${AUTH_USER_SELECT}
     WHERE u.username = ?
       AND u.is_active = 1
     LIMIT 1`,
    [username]
  );

  return rows[0] || null;
};

export const findActiveUserById = async (id) => {
  const [rows] = await pool.execute(
    `${AUTH_USER_SELECT}
     WHERE u.id = ?
       AND u.is_active = 1
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

// Al cambiar la contraseña se sube la versión: las demás sesiones del usuario quedan cerradas
export const updatePasswordHash = async (id, passwordHash) => {
  await pool.execute(
    "UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?",
    [passwordHash, id]
  );
};
