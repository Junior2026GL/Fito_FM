-- =============================================================
--  fito_fm – Migración 002: índices y ajustes a la tabla users
--  Ejecuta este script directamente en la base de datos fito_fm
-- =============================================================

USE fito_fm;

-- Ampliar el campo password_hash (bcrypt genera hashes de 60 chars,
-- pero dejamos margen para otros algoritmos en el futuro)
ALTER TABLE users
  MODIFY COLUMN password_hash VARCHAR(300) NOT NULL;

-- Índice en is_active (se filtra en cada login y listado de usuarios)
ALTER TABLE users ADD INDEX idx_users_is_active (is_active);

-- Índice en role (filtros por rol en el listado de usuarios)
ALTER TABLE users ADD INDEX idx_users_role (role);

-- Índice en created_at (ordenamiento por defecto en el listado)
ALTER TABLE users ADD INDEX idx_users_created_at (created_at);

-- Nota: el campo email ya tiene UNIQUE, lo que crea un índice implícito.
-- No es necesario agregar uno adicional.
