import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { apiLimiter } from "./shared/middleware/rate-limit.middleware.js";
import { notFoundHandler } from "./shared/middleware/not-found.middleware.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";

export const createApp = () => {
  const app = express();

  // Detrás del proxy del hosting, req.ip debe ser la IP real del cliente (no la del proxy):
  // se usa en la auditoría y en el límite de intentos de login.
  app.set("trust proxy", env.TRUST_PROXY ?? (env.NODE_ENV === "production" ? 1 : 0));

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Sin cabecera Origin (chequeos de salud, curl, servidor a servidor) CORS no aplica:
        // solo protege a los navegadores, y las rutas privadas siguen exigiendo token.
        if (!origin) {
          return callback(null, true);
        }
        // En desarrollo: permitir cualquier localhost (el puerto de Vite varía)
        if (env.NODE_ENV === "development" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        // Cualquier otro entorno: solo el dominio configurado
        if (origin === env.FRONTEND_URL) {
          return callback(null, true);
        }
        callback(new Error("Origen no permitido por CORS"));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api", apiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
