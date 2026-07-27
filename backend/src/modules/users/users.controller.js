import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as usersService from "./users.service.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.validated.body);

  return successResponse(res, {
    statusCode: 201,
    message: "Usuario creado correctamente",
    data: user
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await usersService.listUsers(req.validated.query);

  return successResponse(res, {
    message: "Usuarios obtenidos correctamente",
    data: result.data,
    meta: result.meta
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await usersService.getUser(req.validated.params.id);

  return successResponse(res, { data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(
    req.validated.params.id,
    req.validated.body
  );

  return successResponse(res, {
    message: "Usuario actualizado correctamente",
    data: user
  });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await usersService.toggleUserStatus(
    req.validated.params.id,
    req.user.sub
  );

  const action = user.is_active ? "activado" : "desactivado";

  return successResponse(res, {
    message: `Usuario ${action} correctamente`,
    data: user
  });
});
