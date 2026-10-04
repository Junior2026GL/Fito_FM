import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as authService from "./auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body, { ip: req.ip });

  return successResponse(res, {
    message: "Inicio de sesión correcto",
    data: result
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.sub, req.validated.body, { ip: req.ip });

  return successResponse(res, {
    message: "Contraseña actualizada correctamente"
  });
});
