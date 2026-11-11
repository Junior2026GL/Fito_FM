-- =============================================================
--  fito_fm – Migración 012: módulo "jrv" (buscar y editar una JRV)
--  Ejecuta este script directamente en la base de datos de producción
--  (es seguro repetirlo: si el módulo ya existe, solo actualiza su texto)
-- =============================================================

INSERT INTO modules (`key`, label, description) VALUES
  ('jrv', 'Editar JRV', 'Buscar una JRV por número de urna y corregir sus votos')
ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description);
