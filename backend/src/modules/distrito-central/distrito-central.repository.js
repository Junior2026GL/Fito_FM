import { pool } from "../../infrastructure/database/connection.js";

export const MUNICIPIO = "DISTRITO CENTRAL";

// Casilla 93 … Casilla 115: marcas por posición de la papeleta (23 posiciones)
export const CASILLAS = Array.from({ length: 23 }, (_, i) => 93 + i);

const SUMA_CASILLAS = CASILLAS.map((n) => `SUM(\`Casilla ${n}\`) AS c${n}`).join(", ");
const COLUMNAS_CASILLAS = CASILLAS.map((n) => `\`Casilla ${n}\` AS c${n}`).join(", ");

// Los textos de la tabla traen espacios al final ("BO. EL BOSQUE "), por eso se comparan con TRIM
const SECTOR_ELECTORAL = "TRIM(`Sector Electoral`)";
const CENTRO = "TRIM(`Centro de Votación`)";

const buildWhere = ({ ciudad, sector, sector_electoral: sectorElectoral, centro }) => {
  const conditions = ["Municipio = ? COLLATE utf8mb4_general_ci"];
  const params = [MUNICIPIO];

  if (ciudad) {
    conditions.push("Ciudad = ? COLLATE utf8mb4_general_ci");
    params.push(ciudad);
  }
  if (sector) {
    conditions.push("TRIM(Sector) = ? COLLATE utf8mb4_general_ci");
    params.push(sector);
  }
  if (sectorElectoral) {
    conditions.push(`${SECTOR_ELECTORAL} = ? COLLATE utf8mb4_general_ci`);
    params.push(sectorElectoral);
  }
  if (centro) {
    conditions.push(`${CENTRO} = ? COLLATE utf8mb4_general_ci`);
    params.push(centro);
  }

  return { where: conditions.join(" AND "), params };
};

// Columnas por las que se agrupa cada nivel del desglose
const NIVELES = {
  ciudad: { select: "Ciudad AS ciudad", group: "Ciudad", alias: "ciudad" },
  sector: { select: "TRIM(Sector) AS sector", group: "TRIM(Sector)", alias: "sector" },
  centro: {
    select: `${SECTOR_ELECTORAL} AS sector_electoral, ${CENTRO} AS centro`,
    group: `${SECTOR_ELECTORAL}, ${CENTRO}`,
    alias: "sector_electoral, centro"
  }
};

export const getOpcionesFiltros = async () => {
  const [rows] = await pool.execute(
    `SELECT DISTINCT
       Ciudad AS ciudad,
       TRIM(Sector) AS sector,
       ${SECTOR_ELECTORAL} AS sector_electoral,
       ${CENTRO} AS centro
     FROM dip_fito_fm
     WHERE Municipio = ? COLLATE utf8mb4_general_ci
     ORDER BY ciudad, sector, sector_electoral, centro`,
    [MUNICIPIO]
  );
  return rows;
};

export const getTotales = async (filtros) => {
  const { where, params } = buildWhere(filtros);

  const [[votos]] = await pool.execute(
    `SELECT COUNT(*) AS total_jrv, ${SUMA_CASILLAS} FROM dip_fito_fm WHERE ${where}`,
    params
  );

  // La carga electoral se repite en cada urna de un mismo centro: se deduplica por centro antes de sumar
  const [[centros]] = await pool.execute(
    `SELECT COUNT(*) AS total_centros, COALESCE(SUM(carga), 0) AS carga_electoral
     FROM (
       SELECT DISTINCT ${SECTOR_ELECTORAL} AS se, ${CENTRO} AS centro, \`Carga Electoral\` AS carga
       FROM dip_fito_fm
       WHERE ${where}
     ) t`,
    params
  );

  return { votos, centros };
};

// Una fila por grupo (ciudad, sector o centro) con su cantidad de urnas y sus marcas por casilla
export const getDesglosePorNivel = async (nivel, filtros) => {
  const { select, group } = NIVELES[nivel];
  const { where, params } = buildWhere(filtros);

  const [rows] = await pool.execute(
    `SELECT ${select}, COUNT(*) AS jrv, ${SUMA_CASILLAS}
     FROM dip_fito_fm
     WHERE ${where}
     GROUP BY ${group}
     ORDER BY ${group}`,
    params
  );
  return rows;
};

// Carga electoral y cantidad de centros por grupo, deduplicados por centro
export const getCargaPorNivel = async (nivel, filtros) => {
  const { alias } = NIVELES[nivel];
  const { where, params } = buildWhere(filtros);

  const [rows] = await pool.execute(
    `SELECT ${alias}, COUNT(*) AS centros, COALESCE(SUM(carga), 0) AS carga_electoral
     FROM (
       SELECT DISTINCT
         Ciudad AS ciudad,
         TRIM(Sector) AS sector,
         ${SECTOR_ELECTORAL} AS sector_electoral,
         ${CENTRO} AS centro,
         \`Carga Electoral\` AS carga
       FROM dip_fito_fm
       WHERE ${where}
     ) t
     GROUP BY ${alias}`,
    params
  );
  return rows;
};

export const getUrnas = async (filtros) => {
  const { where, params } = buildWhere(filtros);

  const [rows] = await pool.execute(
    `SELECT \`Número de Urna\` AS urna, ${COLUMNAS_CASILLAS}
     FROM dip_fito_fm
     WHERE ${where}
     ORDER BY \`Número de Urna\``,
    params
  );
  return rows;
};
