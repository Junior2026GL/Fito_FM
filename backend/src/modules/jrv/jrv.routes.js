import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requireModule } from "../../shared/middleware/modules.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { actualizarSchema, buscarSchema } from "./jrv.schema.js";
import { actualizar, buscar } from "./jrv.controller.js";

export const jrvRoutes = Router();

jrvRoutes.use(requireAuth, requireModule("jrv"));

jrvRoutes.get("/", validate(buscarSchema), buscar);
jrvRoutes.put("/", validate(actualizarSchema), actualizar);
