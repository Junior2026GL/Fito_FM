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
     WHERE Municipio = ?
     GROUP BY Municipio`,
    [municipio]
  );
  return rows[0] ?? null;
};
