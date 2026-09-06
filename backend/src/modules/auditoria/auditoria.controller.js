import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as service from "./auditoria.service.js";

export const listLogs = asyncHandler(async (req, res) => {
  const result = await service.listLogs(req.validated.query);

  return successResponse(res, {
    data: result.data,
    meta: result.meta
  });
});
