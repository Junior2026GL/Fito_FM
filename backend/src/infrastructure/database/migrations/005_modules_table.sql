-- =============================================================
--  fito_fm – Migración 005: tabla de módulos + asignación por usuario
--  Ejecuta este script directamente en la base de datos de producción
-- =============================================================

-- 1. Catálogo de módulos disponibles en el sistema
CREATE TABLE IF NOT EXISTS modules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO modules (`key`, label, description) VALUES
  ('diputados', 'Diputados', 'Ver resultados electorales por municipio y ciudad')
ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description);

-- 2. Tabla pivote: qué usuarios tienen acceso a qué módulos
CREATE TABLE IF NOT EXISTS user_modules (
  user_id BIGINT UNSIGNED NOT NULL,
  module_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, module_id),
  CONSTRAINT fk_user_modules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_modules_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- 3. Migra los accesos que ya estaban guardados en la columna JSON users.modules
INSERT IGNORE INTO user_modules (user_id, module_id)
SELECT u.id, m.id
FROM users u
JOIN modules m ON JSON_CONTAINS(u.modules, JSON_QUOTE(m.`key`));

-- 4. La columna JSON queda reemplazada por la tabla user_modules
ALTER TABLE users DROP COLUMN modules;
