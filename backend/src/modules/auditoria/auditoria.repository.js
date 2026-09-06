import { pool } from "../../infrastructure/database/connection.js";
import { getPagination } from "../../shared/utils/pagination.js";

export const logEvent = async ({
  userId = null,
  userName = null,
  action,
  entity,
  entityId = null,
  details = null,
  ipAddress = null
}) => {
  await pool.execute(
    `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      userName,
      action,
      entity,
      entityId != null ? String(entityId) : null,
      details != null ? JSON.stringify(details) : null,
      ipAddress
    ]
  );
};

export const findAll = async ({ page, limit, search, action, entity }) => {
  const { page: parsedPage, limit: parsedLimit, offset } = getPagination(page, limit);

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(user_name LIKE ? OR entity_id LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (action) {
    conditions.push("action = ?");
    params.push(action);
  }

  if (entity) {
    conditions.push("entity = ?");
    params.push(entity);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM audit_logs ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT id, user_id, user_name, action, entity, entity_id, details, ip_address, created_at
     FROM audit_logs
     ${where}
     ORDER BY created_at DESC
     LIMIT ${parsedLimit} OFFSET ${offset}`,
    params
  );

  return {
    data: rows,
    meta: {
      total: Number(total),
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(Number(total) / parsedLimit)
    }
  };
};
