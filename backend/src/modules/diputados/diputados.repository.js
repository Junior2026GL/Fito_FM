import { pool } from "../../infrastructure/database/connection.js";

export const getMunicipios = async () => {
  const [rows] = await pool.execute(
    `SELECT
       Municipio           AS municipio,
       SUM(\`Carga Electoral\`) AS carga_electoral
     FROM dip_fito_fm
     GROUP BY Municipio
     ORDER BY Municipio`
  );
  return rows;
};

export const getCiudadesByMunicipio = async (municipio) => {
  const [rows] = await pool.execute(
    `SELECT DISTINCT Ciudad AS ciudad
     FROM dip_fito_fm
     WHERE Municipio = ? COLLATE utf8mb4_general_ci
     ORDER BY Ciudad`,
    [municipio]
  );
  return rows.map((r) => r.ciudad);
};

export const getMunicipio = async (municipio, ciudad) => {
  const casillas = Array.from({ length: 23 }, (_, i) => 93 + i);
  const sumaVotos = casillas.map((n) => `COALESCE(\`Casilla ${n}\`, 0)`).join(" + ");

  const params = [municipio];
  let ciudadFilter = "";
  if (ciudad) {
    ciudadFilter = "AND Ciudad = ? COLLATE utf8mb4_general_ci";
    params.push(ciudad);
  }

  const [rows] = await pool.execute(
    `SELECT
       Municipio                                AS municipio,
       SUM(\`Carga Electoral\`)                  AS carga_electoral,
       COUNT(*)                                 AS total_jrv,
       SUM(${sumaVotos})                        AS total_votos,
       COUNT(DISTINCT \`Centro de Votación\`)    AS total_centros
     FROM dip_fito_fm
     WHERE Municipio = ? COLLATE utf8mb4_general_ci ${ciudadFilter}
     GROUP BY Municipio`,
    params
  );
  return rows[0] ?? null;
};

export const getVotosByMunicipio = async (municipio, ciudad) => {
  const casillas = Array.from({ length: 23 }, (_, i) => 93 + i);

  const selects = casillas
    .map((n) => `SUM(\`Casilla ${n}\`) AS c${n}`)
    .join(",\n       ");

  const params = [municipio];
  let ciudadFilter = "";
  if (ciudad) {
    ciudadFilter = "AND Ciudad = ? COLLATE utf8mb4_general_ci";
    params.push(ciudad);
  }

  const [rows] = await pool.execute(
    `SELECT ${selects} FROM dip_fito_fm WHERE Municipio = ? COLLATE utf8mb4_general_ci ${ciudadFilter}`,
    params
  );

  if (!rows[0]) return [];

  return casillas
    .map((n) => ({ casilla: n, votos: Number(rows[0][`c${n}`]) || 0 }))
    .sort((a, b) => b.votos - a.votos);
};
