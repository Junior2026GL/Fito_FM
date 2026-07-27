import { api } from "../../../services/api.js";

export const getUsers = async ({ page = 1, limit = 20, search = "", role = "", active = "" } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (active !== "") params.set("active", active);

  const response = await api.get(`/users?${params}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/users/${id}/status`);
  return response.data;
};
