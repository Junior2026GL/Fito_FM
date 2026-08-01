import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { listMunicipios, getMunicipio } from "./diputados.controller.js";

export const diputadosRoutes = Router();

diputadosRoutes.use(requireAuth);

diputadosRoutes.get("/municipios", listMunicipios);
diputadosRoutes.get("/municipios/:municipio", getMunicipio);
