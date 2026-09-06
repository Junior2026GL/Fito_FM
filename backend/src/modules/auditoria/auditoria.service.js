import * as repo from "./auditoria.repository.js";

export const logEvent = (data) => repo.logEvent(data);

export const listLogs = (query) => repo.findAll(query);
