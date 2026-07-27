import bcrypt from "bcryptjs";
import { AppError } from "../../shared/errors/app-error.js";
import * as usersRepository from "./users.repository.js";

export const createUser = async ({ name, username, email, password, role }) => {
  const emailConflict = await usersRepository.findByEmail(email);
  if (emailConflict) throw new AppError("El correo ya está en uso", 409);

  const usernameConflict = await usersRepository.findByUsername(username);
  if (usernameConflict) throw new AppError("El nombre de usuario ya está en uso", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  return usersRepository.create({ name, username, email, passwordHash, role });
};

export const listUsers = async (query) => {
  return usersRepository.findAll(query);
};

export const getUser = async (id) => {
  const user = await usersRepository.findById(id);
  if (!user) throw new AppError("Usuario no encontrado", 404);
  return user;
};

export const updateUser = async (id, data) => {
  const user = await usersRepository.findById(id);
  if (!user) throw new AppError("Usuario no encontrado", 404);

  // Verificar unicidad del correo si cambió
  if (data.email.toLowerCase() !== user.email.toLowerCase()) {
    const conflict = await usersRepository.findByEmail(data.email, id);
    if (conflict) throw new AppError("El correo ya está en uso por otro usuario", 409);
  }

  // Verificar unicidad del username si cambió
  if (data.username.toLowerCase() !== user.username.toLowerCase()) {
    const conflict = await usersRepository.findByUsername(data.username, id);
    if (conflict) throw new AppError("El nombre de usuario ya está en uso", 409);
  }

  return usersRepository.update(id, data);
};

export const toggleUserStatus = async (id, requestingUserId) => {
  if (id === requestingUserId) {
    throw new AppError("No puedes cambiar el estado de tu propia cuenta", 400);
  }

  const user = await usersRepository.findById(id);
  if (!user) throw new AppError("Usuario no encontrado", 404);

  return usersRepository.setActive(id, !user.is_active);
};
