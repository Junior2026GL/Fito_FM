import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requireModule } from "../../shared/middleware/modules.middleware.js";
import { listMunicipios, getCiudades, getMunicipio, getVotos } from "./diputados.controller.js";

export const diputadosRoutes = Router();

diputadosRoutes.use(requireAuth, requireModule("diputados"));

diputadosRoutes.get("/municipios", listMunicipios);
diputadosRoutes.get("/municipios/:municipio/ciudades", getCiudades);
diputadosRoutes.get("/municipios/:municipio", getMunicipio);
diputadosRoutes.get("/municipios/:municipio/votos", getVotos);
