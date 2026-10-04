-- =============================================================
--  fito_fm – Migración 008: cargo, teléfono y ciudad del usuario
--  Ejecuta este script directamente en la base de datos fito_fm
--  (ejecútalo UNA sola vez: si las columnas ya existen dará error)
-- =============================================================

ALTER TABLE users
  ADD COLUMN job_title VARCHAR(100) NULL AFTER email,
  ADD COLUMN phone VARCHAR(30) NULL AFTER job_title,
  ADD COLUMN city VARCHAR(100) NULL AFTER phone;
