import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import * as authRepository from "./auth.repository.js";
import * as auditoriaService from "../auditoria/auditoria.service.js";

export const login = async ({ username, password }, { ip } = {}) => {
  const user = await authRepository.findUserByUsername(username);

  if (!user) {
    await auditoriaService.logEvent({ action: "login_failed", entity: "auth", userName: username, ipAddress: ip });
    throw new AppError("Credenciales incorrectas", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    await auditoriaService.logEvent({ action: "login_failed", entity: "auth", userId: user.id, userName: user.name, ipAddress: ip });
    throw new AppError("Credenciales incorrectas", 401);
  }

  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      role: user.role,
      modules: user.modules ?? []
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );

  await auditoriaService.logEvent({ action: "login", entity: "auth", userId: user.id, userName: user.name, ipAddress: ip });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      modules: user.modules ?? []
    }
  };
};

export const changePassword = async (userId, { currentPassword, newPassword }, { ip } = {}) => {
  const user = await authRepository.findPasswordHashById(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.password_hash);

  if (!currentMatches) {
    throw new AppError("La contraseña actual es incorrecta", 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError("La nueva contraseña debe ser diferente a la actual", 400);
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await authRepository.updatePasswordHash(user.id, newHash);

  await auditoriaService.logEvent({
    action: "password_change",
    entity: "user",
    entityId: String(user.id),
    userId: user.id,
    userName: user.name,
    ipAddress: ip
  });
};
