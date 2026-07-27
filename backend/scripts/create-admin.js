import bcrypt from "bcryptjs";
import { pool } from "../src/infrastructure/database/connection.js";

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error(
    'Uso: npm run create-admin -- "Nombre Apellido" admin@correo.com contraseña'
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("La contraseña debe contener al menos 8 caracteres");
  process.exit(1);
}

// Generar username automáticamente a partir del nombre
// "Juan Pérez" → "juan_perez"
const username = name
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")  // quitar tildes
  .replace(/\s+/g, "_")             // espacios → guión bajo
  .replace(/[^a-z0-9_-]/g, "");     // quitar caracteres especiales

try {
  const passwordHash = await bcrypt.hash(password, 12);

  await pool.execute(
    `INSERT INTO users (name, username, email, password_hash, role)
     VALUES (?, ?, ?, ?, 'admin')`,
    [name, username, email, passwordHash]
  );

  console.log(`Administrador creado correctamente`);
  console.log(`  Usuario:    ${username}`);
  console.log(`  Correo:     ${email}`);
} catch (error) {
  console.error("No se pudo crear el administrador:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
