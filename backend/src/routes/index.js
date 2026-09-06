import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { usersRoutes } from "../modules/users/users.routes.js";
import { diputadosRoutes } from "../modules/diputados/diputados.routes.js";
import { modulesRoutes } from "../modules/modules/modules.routes.js";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import { auditoriaRoutes } from "../modules/auditoria/auditoria.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", usersRoutes);
apiRouter.use("/diputados", diputadosRoutes);
apiRouter.use("/modules", modulesRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/auditoria", auditoriaRoutes);

