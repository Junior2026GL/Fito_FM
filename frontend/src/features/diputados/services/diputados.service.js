import { api } from "../../../services/api.js";

export const getMunicipios = async () => {
  const response = await api.get("/diputados/municipios");
  return response.data.data;
};

export const getMunicipio = async (municipio) => {
  const response = await api.get(`/diputados/municipios/${encodeURIComponent(municipio)}`);
  return response.data.data;
};
