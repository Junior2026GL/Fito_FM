import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as service from "./diputados.service.js";

export const listMunicipios = asyncHandler(async (_req, res) => {
  const data = await service.getMunicipios();
  return successResponse(res, { data });
});

export const getCiudades = asyncHandler(async (req, res) => {
  const data = await service.getCiudadesByMunicipio(req.params.municipio);
  return successResponse(res, { data });
});

export const getMunicipio = asyncHandler(async (req, res) => {
  const data = await service.getMunicipio(req.params.municipio, req.query.ciudad);
  return successResponse(res, { data });
});

export const getVotos = asyncHandler(async (req, res) => {
  const data = await service.getVotosByMunicipio(req.params.municipio, req.query.ciudad);
  return successResponse(res, { data });
});
