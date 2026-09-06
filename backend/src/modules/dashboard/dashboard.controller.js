import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as service from "./dashboard.service.js";

export const getSummary = asyncHandler(async (_req, res) => {
  const data = await service.getSummary();
  return successResponse(res, { data });
});
