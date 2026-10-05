-- =============================================================
--  fito_fm – Migración 011: módulo "distrito_central"
--  Ejecuta este script directamente en la base de datos de producción
--  (es seguro repetirlo: si el módulo ya existe, solo actualiza su texto)
-- =============================================================

INSERT INTO modules (`key`, label, description) VALUES
  ('distrito_central', 'Distrito Central', 'Resultados de diputados por ciudad, sector y centro de votación del Distrito Central')
ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description);
