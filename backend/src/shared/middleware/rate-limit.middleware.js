import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";

// Límite general de la API por IP (el login tiene además su propio límite, más estricto).
// El endpoint de salud queda fuera para no bloquear los chequeos del hosting.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: env.API_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  message: {
    success: false,
    message: "Demasiadas peticiones. Espera un momento e inténtalo de nuevo."
  }
});
