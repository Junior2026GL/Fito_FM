import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requireModule } from "../../shared/middleware/modules.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { filtrosSchema, resumenSchema } from "./distrito-central.schema.js";
import { getFiltros, getResumen } from "./distrito-central.controller.js";

export const distritoCentralRoutes = Router();

distritoCentralRoutes.use(requireAuth, requireModule("distrito_central"));

distritoCentralRoutes.get("/filtros", validate(filtrosSchema), getFiltros);
distritoCentralRoutes.get("/resumen", validate(resumenSchema), getResumen);
