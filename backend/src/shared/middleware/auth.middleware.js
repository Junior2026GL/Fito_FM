import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { pool } from "../../infrastructure/database/connection.js";

const unauthorized = (res, message) =>
  res.status(401).json({ success: false, message });

export const requireAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorized(res, "Token de autenticación requerido");
  }

  let payload;

  try {
    payload = jwt.verify(authorization.slice(7), env.JWT_SECRET);
  } catch {
    return unauthorized(res, "Token inválido o vencido");
  }

  try {
    // La sesión solo es válida si la cuenta sigue activa y la versión del token
    // coincide con la actual (cambia al restablecer contraseña, desactivar o cambiar permisos).
    const [rows] = await pool.execute(
      "SELECT is_active, token_version FROM users WHERE id = ? LIMIT 1",
      [payload.sub]
    );
    const account = rows[0];

    // Los tokens emitidos antes de existir la versión equivalen a la versión 0
    if (!account || !account.is_active || account.token_version !== (payload.ver ?? 0)) {
      return unauthorized(res, "Tu sesión ya no es válida. Inicia sesión nuevamente");
    }
  } catch (error) {
    return next(error);
  }

  req.user = payload;
  next();
};
