import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { allowRoles } from "../../shared/middleware/roles.middleware.js";
import { listModules } from "./modules.controller.js";

export const modulesRoutes = Router();

// Solo administradores gestionan/consultan el catálogo de módulos
modulesRoutes.use(requireAuth, allowRoles("admin"));

modulesRoutes.get("/", listModules);
