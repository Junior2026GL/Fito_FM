import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as service from "./distrito-central.service.js";

export const getFiltros = asyncHandler(async (_req, res) => {
  const data = await service.getFiltros();
  return successResponse(res, { data });
});

export const getResumen = asyncHandler(async (req, res) => {
  const data = await service.getResumen(req.validated.query);
  return successResponse(res, { data });
});
