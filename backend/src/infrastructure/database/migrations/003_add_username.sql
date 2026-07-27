-- =============================================================
--  fito_fm – Migración 003: columna username para login
--  Ejecuta este script directamente en la base de datos fito_fm
-- =============================================================

USE fito_fm;

-- 1. Agregar columna username (nullable primero para no romper filas existentes)
ALTER TABLE users
  ADD COLUMN username VARCHAR(80) UNIQUE AFTER name;

-- 2. Rellenar username para usuarios ya existentes usando su nombre
--    (minúsculas, espacios → guión bajo, sin caracteres especiales)
UPDATE users
SET username = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, ' ', '_'),
    '[^a-z0-9_]', ''
  )
)
WHERE username IS NULL;

-- 3. Una vez poblada, hacerla NOT NULL
ALTER TABLE users
  MODIFY COLUMN username VARCHAR(80) NOT NULL;

-- 4. Índice para búsquedas rápidas por username en cada login
ALTER TABLE users
  ADD INDEX idx_users_username (username);
