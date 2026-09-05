import { successResponse } from "../../shared/responses/api-response.js";

export const getHealth = (_req, res) => {
  return successResponse(res, {
    message: "API disponible",
    data: {
      service: "fito_fm",
      status: "ok",
      timestamp: new Date().toISOString()
    }
  });
};
