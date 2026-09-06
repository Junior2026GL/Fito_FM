-- =============================================================
--  fito_fm – Migración 006: módulo "dashboard"
--  Ejecuta este script directamente en la base de datos de producción
-- =============================================================

INSERT INTO modules (`key`, label, description) VALUES
  ('dashboard', 'Dashboard', 'Resumen general de estadísticas del sistema')
ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description);
