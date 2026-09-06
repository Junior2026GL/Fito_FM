-- =============================================================
--  fito_fm – Migración 007: módulo "auditoría" + tabla audit_logs
--  Ejecuta este script directamente en la base de datos de producción
-- =============================================================

-- 1. Bitácora de acciones del sistema
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  user_name VARCHAR(120) NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50) NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_logs_created_at (created_at),
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_action (action)
);

-- 2. Registrar el nuevo módulo asignable "auditoria"
INSERT INTO modules (`key`, label, description) VALUES
  ('auditoria', 'Auditoría', 'Bitácora de acciones realizadas en el sistema')
ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description);
