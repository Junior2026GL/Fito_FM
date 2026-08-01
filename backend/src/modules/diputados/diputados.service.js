import * as repo from "./diputados.repository.js";

export const getMunicipios = () => repo.getMunicipios();

export const getMunicipio = (municipio) => repo.getMunicipio(municipio);

export const getVotosByMunicipio = (municipio) => repo.getVotosByMunicipio(municipio);
