-- =============================================================
--  fito_fm – Migración 009: versión de sesión (token_version)
--  Permite cerrar las sesiones activas de un usuario al restablecer su
--  contraseña, desactivarlo o cambiarle el rol o los módulos.
--  Ejecuta este script directamente en la base de datos fito_fm
--  (ejecútalo UNA sola vez: si la columna ya existe dará error)
--  IMPORTANTE: ejecútalo ANTES de desplegar el backend nuevo.
-- =============================================================

ALTER TABLE users
  ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0 AFTER is_active;
