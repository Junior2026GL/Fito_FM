import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { listMunicipios, getMunicipio, getVotos } from "./diputados.controller.js";

export const diputadosRoutes = Router();

diputadosRoutes.use(requireAuth);

diputadosRoutes.get("/municipios", listMunicipios);
diputadosRoutes.get("/municipios/:municipio", getMunicipio);
diputadosRoutes.get("/municipios/:municipio/votos", getVotos);
