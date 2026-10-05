import { api } from "../../../services/api.js";

export const getFiltros = async () => {
  const response = await api.get("/distrito-central/filtros");
  return response.data.data;
};

// Solo se envían los filtros que tienen valor
export const getResumen = async (filtros = {}) => {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, value]) => value));
  const response = await api.get("/distrito-central/resumen", { params });
  return response.data.data;
};
