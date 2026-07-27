import { pool } from "../../infrastructure/database/connection.js";
import { getPagination } from "../../shared/utils/pagination.js";

export const findAll = async ({ page, limit, search, role, active }) => {
  const { page: parsedPage, limit: parsedLimit, offset } = getPagination(page, limit);

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (role) {
    conditions.push("u.role = ?");
    params.push(role);
  }

  if (active === "1" || active === "0") {
    conditions.push("u.is_active = ?");
    params.push(Number(active));
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM users u ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT
       id, name, username, email, role, is_active, created_at, updated_at
     FROM users u
     ${where}
     ORDER BY created_at DESC
     LIMIT ${parsedLimit} OFFSET ${offset}`,
    params
  );

  const [[globalStats]] = await pool.execute(
    `SELECT
       COUNT(*) AS total_all,
       SUM(is_active = 1) AS active_count,
       SUM(is_active = 0) AS inactive_count,
       SUM(role = 'admin') AS admin_count
     FROM users`
  );

  return {
    data: rows,
    meta: {
      total: Number(total),
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(Number(total) / parsedLimit),
      stats: {
        total: Number(globalStats.total_all),
        active: Number(globalStats.active_count),
        inactive: Number(globalStats.inactive_count),
        admins: Number(globalStats.admin_count)
      }
    }
  };
};

export const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, name, username, email, role, is_active, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const findByEmail = async (email, excludeId = null) => {
  const sql = excludeId
    ? "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1"
    : "SELECT id FROM users WHERE email = ? LIMIT 1";

  const params = excludeId ? [email, excludeId] : [email];
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
};

export const findByUsername = async (username, excludeId = null) => {
  const sql = excludeId
    ? "SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1"
    : "SELECT id FROM users WHERE username = ? LIMIT 1";

  const params = excludeId ? [username, excludeId] : [username];
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
};

export const update = async (id, { name, username, email, role }) => {
  await pool.execute(
    `UPDATE users SET name = ?, username = ?, email = ?, role = ? WHERE id = ?`,
    [name, username.toLowerCase(), email.toLowerCase(), role, id]
  );
  return findById(id);
};

export const create = async ({ name, username, email, passwordHash, role }) => {
  const [result] = await pool.execute(
    `INSERT INTO users (name, username, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [name, username.toLowerCase(), email.toLowerCase(), passwordHash, role]
  );
  return findById(result.insertId);
};

export const setActive = async (id, isActive) => {
  await pool.execute(
    `UPDATE users SET is_active = ? WHERE id = ?`,
    [isActive ? 1 : 0, id]
  );
  return findById(id);
};
