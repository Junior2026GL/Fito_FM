import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token de autenticación requerido"
    });
  }

  const token = authorization.slice(7);

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token inválido o vencido"
    });
  }
};
