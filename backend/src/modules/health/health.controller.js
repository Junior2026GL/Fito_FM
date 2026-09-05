import { successResponse } from "../../shared/responses/api-response.js";
import { pool } from "../../infrastructure/database/connection.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";

export const getHealth = asyncHandler(async (_req, res) => {
  // Diagnóstico temporal: confirma a qué base de datos y host está conectado el proceso
  let db = null;
  try {
    const [[row]] = await pool.query("SELECT DATABASE() AS db_name, @@hostname AS db_host");
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'modules'");
    db = { ...row, has_modules_column: cols.length > 0 };
  } catch (err) {
    db = { error: err.message };
  }

  return successResponse(res, {
    message: "API disponible",
    data: {
      service: "fito_fm",
      status: "ok",
      timestamp: new Date().toISOString(),
      db
    }
  });
});
