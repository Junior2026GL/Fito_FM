import { api } from "../../../services/api.js";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  // Devuelve { token, user } directamente
  return response.data.data;
};
