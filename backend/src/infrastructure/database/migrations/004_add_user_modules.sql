-- =============================================================
--  fito_fm – Migración 004: permisos de módulos por usuario
--  Ejecuta este script directamente en la base de datos fito_fm
-- =============================================================

USE fito_fm;

-- 1. Columna JSON con la lista de módulos asignables (ej. ["diputados"])
ALTER TABLE users
  ADD COLUMN modules JSON NULL AFTER role;

-- 2. Usuarios existentes conservan el acceso que ya tenían a Diputados
SET SQL_SAFE_UPDATES = 0;

UPDATE users
SET modules = JSON_ARRAY('diputados')
WHERE modules IS NULL;

SET SQL_SAFE_UPDATES = 1;
