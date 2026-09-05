import { api } from "../../../services/api.js";

export const getMunicipios = async () => {
  const response = await api.get("/diputados/municipios");
  return response.data.data;
};

export const getCiudadesByMunicipio = async (municipio) => {
  const response = await api.get(`/diputados/municipios/${encodeURIComponent(municipio)}/ciudades`);
  return response.data.data;
};

export const getMunicipio = async (municipio, ciudad) => {
  const response = await api.get(`/diputados/municipios/${encodeURIComponent(municipio)}`, {
    params: ciudad ? { ciudad } : undefined,
  });
  return response.data.data;
};

export const getVotosByMunicipio = async (municipio, ciudad) => {
  const response = await api.get(`/diputados/municipios/${encodeURIComponent(municipio)}/votos`, {
    params: ciudad ? { ciudad } : undefined,
  });
  return response.data.data;
};
