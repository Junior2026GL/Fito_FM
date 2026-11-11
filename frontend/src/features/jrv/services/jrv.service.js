import { api } from "../../../services/api.js";

export const buscarJrv = async (urna) => {
  const response = await api.get("/jrv", { params: { urna } });
  return response.data.data;
};

// votos: { 93: 10, 94: 3, ... } con las casillas a guardar
export const actualizarJrv = async (jrv, votos) => {
  const response = await api.put("/jrv", {
    urna: jrv.urna,
    municipio: jrv.municipio,
    sector_electoral: jrv.sector_electoral,
    centro: jrv.centro,
    votos
  });
  return response.data;
};
