export const APP_NAME = "fito_fm";

// Módulos que un admin puede asignar/revocar por usuario (aparte del rol)
export const AVAILABLE_MODULES = Object.freeze(["diputados"]);

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
});
