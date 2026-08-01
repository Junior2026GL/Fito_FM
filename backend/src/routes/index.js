import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { usersRoutes } from "../modules/users/users.routes.js";
import { diputadosRoutes } from "../modules/diputados/diputados.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", usersRoutes);
apiRouter.use("/diputados", diputadosRoutes);
