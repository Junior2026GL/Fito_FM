import { AppError } from "../../shared/errors/app-error.js";
import * as repository from "./template.repository.js";

export const list = () => repository.findAll();

export const getById = async (id) => {
  const item = await repository.findById(id);

  if (!item) {
    throw new AppError("Registro no encontrado", 404);
  }

  return item;
};

export const create = (data) => repository.create(data);

export const update = async (id, data) => {
  await getById(id);
  return repository.update(id, data);
};

export const remove = async (id) => {
  await getById(id);
  return repository.remove(id);
};
