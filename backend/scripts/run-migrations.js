import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { pool } from "../src/infrastructure/database/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirectory = path.resolve(
  __dirname,
  "../src/infrastructure/database/migrations"
);

const run = async () => {
  try {
    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = await fs.readFile(
        path.join(migrationsDirectory, file),
        "utf8"
      );

      console.log(`Ejecutando migración: ${file}`);
      await pool.query(sql);
    }

    console.log("Migraciones finalizadas");
  } finally {
    await pool.end();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
