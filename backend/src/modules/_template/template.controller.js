import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as service from "./template.service.js";

export const list = asyncHandler(async (_req, res) => {
  const data = await service.list();
  return successResponse(res, { data });
});

export const getById = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return successResponse(res, { data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Registro creado",
    data
  });
});

export const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  return successResponse(res, {
    message: "Registro actualizado",
    data
  });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return successResponse(res, {
    message: "Registro eliminado"
  });
});
