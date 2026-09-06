import { useState, useEffect, useCallback, useRef } from "react";
import { getAuditLogs } from "../services/auditoria.service.js";

const ACTION_LABEL = {
  login: { label: "Inicio de sesión", className: "badge-active" },
  login_failed: { label: "Intento fallido", className: "badge-inactive" },
  create: { label: "Creación", className: "badge-admin" },
  update: { label: "Actualización", className: "badge-user" },
  activate: { label: "Activación", className: "badge-active" },
  deactivate: { label: "Desactivación", className: "badge-inactive" }
};

const ENTITY_LABEL = {
  auth: "Autenticación",
  user: "Usuario"
};

const SkeletonRow = () => (
  <tr>
    {[140, 160, 120, 100, 220, 110].map((w, i) => (
      <td key={i}><div className="skeleton" style={{ width: w, height: 14 }} /></td>
    ))}
  </tr>
);

const formatDetails = (details) => {
  if (!details) return "—";
  const parts = [];
  if (details.name) parts.push(details.name);
  if (details.email) parts.push(details.email);
  if (details.role) parts.push(details.role === "admin" ? "Administrador" : "Usuario");
  return parts.length ? parts.join(" · ") : "—";
};

export const AuditoriaPage = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);

  const searchTimer = useRef(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAuditLogs({ page, limit: 20, search, action: actionFilter, entity: entityFilter });
      setLogs(result.data);
      setMeta(result.meta);
    } catch {
      setError("No se pudo cargar la bitácora.");
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [search, actionFilter, entityFilter]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 380);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Auditoría</h1>
          <p className="page-subtitle">Bitácora de acciones realizadas en el sistema</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por usuario..."
          onChange={handleSearchInput}
        />
        <select className="select-filter" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="">Todas las acciones</option>
          <option value="login">Inicio de sesión</option>
          <option value="login_failed">Intento fallido</option>
          <option value="create">Creación</option>
          <option value="update">Actualización</option>
          <option value="activate">Activación</option>
          <option value="deactivate">Desactivación</option>
        </select>
        <select className="select-filter" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
          <option value="">Todas las entidades</option>
          <option value="auth">Autenticación</option>
          <option value="user">Usuario</option>
        </select>
      </div>

      {error ? (
        <div className="alert alert-error">
          <span className="alert-icon">!</span>
          {error}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={fetchLogs}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Detalle</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <p className="empty-state-title">Sin eventos</p>
                      <p className="empty-state-desc">
                        No se encontraron eventos con los filtros aplicados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actionInfo = ACTION_LABEL[log.action] || { label: log.action, className: "badge-user" };
                  return (
                    <tr key={log.id}>
                      <td className="text-muted">{formatDate(log.created_at)}</td>
                      <td>{log.user_name || "—"}</td>
                      <td>
                        <span className={`badge ${actionInfo.className}`}>{actionInfo.label}</span>
                      </td>
                      <td className="text-muted">{ENTITY_LABEL[log.entity] || log.entity}</td>
                      <td className="text-muted">{formatDetails(log.details)}</td>
                      <td className="text-muted">{log.ip_address || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!loading && meta.totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Página {meta.page} de {meta.totalPages} — {meta.total} resultado{meta.total !== 1 ? "s" : ""}
              </span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>‹</button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`e${i}`} className="page-ellipsis">…</span>
                    ) : (
                      <button key={p} className={`page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>
                        {p}
                      </button>
                    )
                  )}
                <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>›</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
