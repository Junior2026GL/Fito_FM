import { pool } from "../../infrastructure/database/connection.js";

export const getUsersSummary = async () => {
  const [[row]] = await pool.execute(
    `SELECT
       COUNT(*)             AS total,
       SUM(is_active = 1)   AS active,
       SUM(is_active = 0)   AS inactive,
       SUM(role = 'admin')  AS admins
     FROM users`
  );
  return {
    total: Number(row.total),
    active: Number(row.active) || 0,
    inactive: Number(row.inactive) || 0,
    admins: Number(row.admins) || 0
  };
};

export const getElectoralSummary = async () => {
  // Carga Electoral se repite en cada urna de un mismo centro/grupo, por eso se deduplica antes de sumar/contar
  const [[cargaRow]] = await pool.execute(
    `SELECT
       SUM(carga_electoral) AS carga_electoral,
       COUNT(*)             AS total_centros
     FROM (
       SELECT DISTINCT \`Centro de Votación\` AS centro, \`Carga Electoral\` AS carga_electoral
       FROM dip_fito_fm
     ) t`
  );

  const [[totalsRow]] = await pool.execute(
    `SELECT
       COUNT(*)                    AS total_jrv,
       COUNT(DISTINCT Municipio)   AS total_municipios
     FROM dip_fito_fm`
  );

  return {
    carga_electoral: Number(cargaRow.carga_electoral) || 0,
    total_centros: Number(cargaRow.total_centros) || 0,
    total_jrv: Number(totalsRow.total_jrv) || 0,
    total_municipios: Number(totalsRow.total_municipios) || 0
  };
};
