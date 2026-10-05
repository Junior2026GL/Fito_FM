-- =============================================================
--  fito_fm – Migración 010: tabla dip_fito_fm (resultados de diputados)
--
--  Deja versionada en el repositorio la estructura de la tabla que ya existe
--  en producción. Es segura de repetir: si la tabla existe no hace nada.
--  En una base nueva crea la tabla VACÍA; los datos se cargan aparte.
--
--  Notas de la estructura (tal como está en producción):
--    * Cada fila es una urna (JRV) de un centro de votación.
--    * "Carga Electoral" se repite en cada urna de un mismo centro, por eso
--      las consultas la deduplican por centro antes de sumarla.
--    * "Casilla 93" … "Casilla 115" son los votos de las posiciones 1 a 23.
--    * No tiene llave primaria ni índices (3.399 filas al momento de crear esta
--      migración; no se necesitan).
-- =============================================================

CREATE TABLE IF NOT EXISTS `dip_fito_fm` (
  `Municipio` text,
  `Ciudad` text,
  `Sector` text,
  `Distrito` text,
  `Carga Electoral` int DEFAULT NULL,
  `Categoria` text,
  `Sector Electoral` text,
  `Centro de Votación` text,
  `Número de Urna` int DEFAULT NULL,
  `Casilla 93` int DEFAULT NULL,
  `Casilla 94` int DEFAULT NULL,
  `Casilla 95` int DEFAULT NULL,
  `Casilla 96` int DEFAULT NULL,
  `Casilla 97` int DEFAULT NULL,
  `Casilla 98` int DEFAULT NULL,
  `Casilla 99` int DEFAULT NULL,
  `Casilla 100` int DEFAULT NULL,
  `Casilla 101` int DEFAULT NULL,
  `Casilla 102` int DEFAULT NULL,
  `Casilla 103` int DEFAULT NULL,
  `Casilla 104` int DEFAULT NULL,
  `Casilla 105` int DEFAULT NULL,
  `Casilla 106` int DEFAULT NULL,
  `Casilla 107` int DEFAULT NULL,
  `Casilla 108` int DEFAULT NULL,
  `Casilla 109` int DEFAULT NULL,
  `Casilla 110` int DEFAULT NULL,
  `Casilla 111` int DEFAULT NULL,
  `Casilla 112` int DEFAULT NULL,
  `Casilla 113` int DEFAULT NULL,
  `Casilla 114` int DEFAULT NULL,
  `Casilla 115` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
