import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import * as authRepository from "./auth.repository.js";

export const login = async ({ username, password }) => {
  const user = await authRepository.findUserByUsername(username);

  if (!user) {
    throw new AppError("Credenciales incorrectas", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError("Credenciales incorrectas", 401);
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};
