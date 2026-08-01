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

export const getMunicipio = async (municipio) => {
  const [rows] = await pool.execute(
    `SELECT
       Municipio                      AS municipio,
       SUM(\`Carga Electoral\`)        AS carga_electoral,
       COUNT(*)                       AS total_jrv
     FROM dip_fito_fm
     WHERE Municipio = ? COLLATE utf8mb4_general_ci
     GROUP BY Municipio`,
    [municipio]
  );
  return rows[0] ?? null;
};

export const getVotosByMunicipio = async (municipio) => {
  const casillas = Array.from({ length: 23 }, (_, i) => 93 + i);

  const selects = casillas
    .map((n) => `SUM(\`Casilla ${n}\`) AS c${n}`)
    .join(",\n       ");

  const [rows] = await pool.execute(
    `SELECT ${selects} FROM dip_fito_fm WHERE Municipio = ? COLLATE utf8mb4_general_ci`,
    [municipio]
  );

  if (!rows[0]) return [];

  return casillas
    .map((n) => ({ casilla: n, votos: Number(rows[0][`c${n}`]) || 0 }))
    .sort((a, b) => b.votos - a.votos);
};
