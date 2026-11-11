import { pool } from "../../infrastructure/database/connection.js";

// Casilla 93 … Casilla 115: votos por posición de la papeleta (23 posiciones)
export const CASILLAS = Array.from({ length: 23 }, (_, i) => 93 + i);

const COLUMNAS_CASILLAS = CASILLAS.map((n) => `\`Casilla ${n}\` AS c${n}`).join(", ");

// La tabla no tiene llave primaria: una JRV se identifica por urna + municipio + sector electoral + centro.
// Los textos traen espacios al final, por eso se comparan con TRIM.
const IDENTIDAD = `\`Número de Urna\` = ?
  AND TRIM(Municipio) = ? COLLATE utf8mb4_general_ci
  AND TRIM(\`Sector Electoral\`) = ? COLLATE utf8mb4_general_ci
  AND TRIM(\`Centro de Votación\`) = ? COLLATE utf8mb4_general_ci`;

const identidadParams = ({ urna, municipio, sector_electoral: sectorElectoral, centro }) => [
  urna,
  municipio,
  sectorElectoral,
  centro
];

export const buscarPorUrna = async (urna) => {
  const [rows] = await pool.execute(
    `SELECT
       \`Número de Urna\` AS urna,
       TRIM(Municipio) AS municipio,
       TRIM(Ciudad) AS ciudad,
       TRIM(Sector) AS sector,
       TRIM(\`Sector Electoral\`) AS sector_electoral,
       TRIM(\`Centro de Votación\`) AS centro,
       TRIM(Categoria) AS categoria,
       \`Carga Electoral\` AS carga_electoral,
       ${COLUMNAS_CASILLAS}
     FROM dip_fito_fm
     WHERE \`Número de Urna\` = ?
     ORDER BY municipio, sector_electoral, centro`,
    [urna]
  );
  return rows;
};

export const contarCoincidencias = async (identidad) => {
  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM dip_fito_fm WHERE ${IDENTIDAD}`,
    identidadParams(identidad)
  );
  return Number(total);
};

export const obtenerVotos = async (identidad) => {
  const [rows] = await pool.execute(
    `SELECT ${COLUMNAS_CASILLAS} FROM dip_fito_fm WHERE ${IDENTIDAD} LIMIT 1`,
    identidadParams(identidad)
  );
  return rows[0] ?? null;
};

// votos: { 93: 10, 94: 3, ... } solo con las casillas que se cambian
export const actualizarVotos = async (identidad, votos) => {
  const entradas = Object.entries(votos);
  const set = entradas.map(([casilla]) => `\`Casilla ${casilla}\` = ?`).join(", ");

  const [result] = await pool.execute(
    `UPDATE dip_fito_fm SET ${set} WHERE ${IDENTIDAD} LIMIT 1`,
    [...entradas.map(([, valor]) => valor), ...identidadParams(identidad)]
  );
  return result.affectedRows;
};
