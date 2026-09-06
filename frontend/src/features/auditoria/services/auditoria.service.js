import { api } from "../../../services/api.js";

export const getAuditLogs = async ({ page = 1, limit = 20, search = "", action = "", entity = "" } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (search) params.set("search", search);
  if (action) params.set("action", action);
  if (entity) params.set("entity", entity);

  const response = await api.get(`/auditoria?${params}`);
  return response.data;
};
