import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./shared/middleware/not-found.middleware.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // En desarrollo: permitir cualquier localhost (el puerto de Vite varía)
        if (env.NODE_ENV === "development") {
          if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
            return callback(null, true);
          }
        }
        // En producción: solo el dominio configurado
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

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
