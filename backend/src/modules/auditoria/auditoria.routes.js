import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requireModule } from "../../shared/middleware/modules.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { listLogsSchema } from "./auditoria.schema.js";
import { listLogs } from "./auditoria.controller.js";

export const auditoriaRoutes = Router();

auditoriaRoutes.use(requireAuth, requireModule("auditoria"));

auditoriaRoutes.get("/", validate(listLogsSchema), listLogs);
