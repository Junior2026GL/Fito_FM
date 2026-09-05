import * as repo from "./diputados.repository.js";

export const getMunicipios = () => repo.getMunicipios();

export const getCiudadesByMunicipio = (municipio) => repo.getCiudadesByMunicipio(municipio);

export const getMunicipio = (municipio, ciudad) => repo.getMunicipio(municipio, ciudad);

export const getVotosByMunicipio = (municipio, ciudad) => repo.getVotosByMunicipio(municipio, ciudad);
