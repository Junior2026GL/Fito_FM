import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as modulesService from "./modules.service.js";

export const listModules = asyncHandler(async (_req, res) => {
  const data = await modulesService.listModules();
  return successResponse(res, { data });
});
