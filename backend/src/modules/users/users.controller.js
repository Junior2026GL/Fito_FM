import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as usersService from "./users.service.js";
import * as auditoriaService from "../auditoria/auditoria.service.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.validated.body);

  await auditoriaService.logEvent({
    userId: req.user.sub,
    userName: req.user.name,
    action: "create",
    entity: "user",
    entityId: user.id,
    details: { name: user.name, email: user.email, role: user.role, modules: user.modules },
    ipAddress: req.ip
  });

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

  await auditoriaService.logEvent({
    userId: req.user.sub,
    userName: req.user.name,
    action: "update",
    entity: "user",
    entityId: user.id,
    details: { name: user.name, email: user.email, role: user.role, modules: user.modules },
    ipAddress: req.ip
  });

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

  await auditoriaService.logEvent({
    userId: req.user.sub,
    userName: req.user.name,
    action: user.is_active ? "activate" : "deactivate",
    entity: "user",
    entityId: user.id,
    details: { name: user.name },
    ipAddress: req.ip
  });

  return successResponse(res, {
    message: `Usuario ${action} correctamente`,
    data: user
  });
});
