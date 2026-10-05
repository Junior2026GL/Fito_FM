const SEPARADOR = "\u0001";

export const formatCiudad = (ciudad) =>
  ciudad ? ciudad.charAt(0) + ciudad.slice(1).toLowerCase() : ciudad;

export const formatNumber = (n) => (n != null ? Number(n).toLocaleString("es-HN") : "—");

// Un centro se identifica por su sector electoral + su nombre (el nombre solo puede repetirse)
export const centroKey = (c) => `${c.sector_electoral}${SEPARADOR}${c.centro}`;

// Igual que el desplegable del portal de resultados: "SECTOR ELECTORAL - CENTRO"
export const centroLabel = (c) => `${c.sector_electoral} - ${c.centro}`;
