import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, changePassword } from "./auth.controller.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { loginSchema, changePasswordSchema } from "./auth.schema.js";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos."
  }
});

export const authRoutes = Router();

authRoutes.post("/login", loginLimiter, validate(loginSchema), login);
authRoutes.post("/change-password", requireAuth, validate(changePasswordSchema), changePassword);
