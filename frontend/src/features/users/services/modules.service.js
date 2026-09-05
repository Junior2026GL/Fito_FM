import { api } from "../../../services/api.js";

export const getModules = async () => {
  const response = await api.get("/modules");
  return response.data.data;
};
