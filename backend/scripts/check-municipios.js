import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const [rows] = await pool.execute(
  `SELECT
     Municipio         AS municipio,
     COUNT(*)          AS total_jrv,
     SUM(\`Carga Electoral\`) AS carga_electoral
   FROM dip_fito_fm
   GROUP BY Municipio
   ORDER BY Municipio`
);

console.log(`\nMunicipios en dip_fito_fm — total: ${rows.length}\n`);
console.log("N°  | Municipio                     | JRV  | Carga Electoral");
console.log("----|-------------------------------|------|----------------");
rows.forEach((r, i) => {
  const n   = String(i + 1).padStart(3);
  const mun = r.municipio.padEnd(29);
  const jrv = String(r.total_jrv).padStart(4);
  const ce  = Number(r.carga_electoral).toLocaleString("es-HN").padStart(16);
  console.log(`${n} | ${mun} | ${jrv} | ${ce}`);
});

await pool.end();
