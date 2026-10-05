import { api } from "../../../services/api.js";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  // Devuelve { token, user } directamente
  return response.data.data;
};

// Devuelve { token }: un token nuevo para esta sesión (las demás quedan cerradas)
export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.post("/auth/change-password", { currentPassword, newPassword });
  return response.data.data;
};
