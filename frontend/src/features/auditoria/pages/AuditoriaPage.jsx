import { useState, useEffect, useCallback, useRef } from "react";
import { getAuditLogs } from "../services/auditoria.service.js";
import {
  IconActivity,
  IconAlert,
  IconAuditoria,
  IconBan,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconEdit,
  IconFilter,
  IconInbox,
  IconKey,
  IconLock,
  IconLogIn,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconXCircle
} from "../../../components/icons.jsx";

const ACTIONS = {
  login: { label: "Inicio de sesión", icon: IconLogIn, tone: "green" },
  login_failed: { label: "Intento fallido", icon: IconXCircle, tone: "red" },
  password_change: { label: "Cambio de contraseña", icon: IconKey, tone: "amber" },
  create: { label: "Creación", icon: IconPlus, tone: "blue" },
  update: { label: "Actualización", icon: IconEdit, tone: "indigo" },
  activate: { label: "Activación", icon: IconCheck, tone: "green" },
  deactivate: { label: "Desactivación", icon: IconBan, tone: "gray" }
};

const ENTITIES = {
  auth: { label: "Autenticación", icon: IconLock },
  user: { label: "Usuario", icon: IconUsers }
};

const SkeletonRow = () => (
  <tr>
    {[130, 150, 130, 110, 200, 110].map((w, i) => (
      <td key={i}><div className="skeleton" style={{ width: w, height: 14 }} /></td>
    ))}
  </tr>
);

const formatDetails = (details) => {
  if (!details) return "";
  const parts = [];
  if (details.name) parts.push(details.name);
  if (details.email) parts.push(details.email);
  if (details.role) parts.push(details.role === "admin" ? "Administrador" : "Usuario");
  return parts.join(" · ");
};

const formatDay = (d) =>
  new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

// Las IPs llegan como "::ffff:100.64.0.8" (IPv4 mapeada); mostramos solo la IPv4
const formatIp = (ip) => (ip ? ip.replace(/^::ffff:/, "") : "");

const getInitial = (name) => (name ? name.trim().charAt(0).toUpperCase() : "?");

export const AuditoriaPage = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
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
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 380);
  };

  const hasFilters = Boolean(searchInput || actionFilter || entityFilter);

  const clearFilters = () => {
    clearTimeout(searchTimer.current);
    setSearchInput("");
    setSearch("");
    setActionFilter("");
    setEntityFilter("");
  };

  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const rangeEnd = Math.min(meta.page * meta.limit, meta.total);

  return (
    <>
      <div className="audit-header">
        <div className="audit-header-main">
          <span className="audit-header-icon"><IconAuditoria /></span>
          <div>
            <h1 className="page-title">Auditoría</h1>
            <p className="page-subtitle">Bitácora de acciones realizadas en el sistema</p>
          </div>
        </div>
        <div className="audit-header-actions">
          <span className="page-chip">
            {meta.total} evento{meta.total !== 1 ? "s" : ""}
          </span>
          <button type="button" className="audit-refresh" onClick={fetchLogs} disabled={loading}>
            <span className={loading ? "audit-spin" : ""}><IconRefresh /></span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="audit-toolbar">
        <label className="audit-search">
          <IconSearch />
          <input
            type="search"
            placeholder="Buscar por usuario..."
            value={searchInput}
            onChange={handleSearchInput}
          />
        </label>

        <label className="audit-select">
          <IconFilter />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} aria-label="Filtrar por acción">
            <option value="">Todas las acciones</option>
            {Object.entries(ACTIONS).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="audit-select">
          <IconLock />
          <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} aria-label="Filtrar por entidad">
            <option value="">Todas las entidades</option>
            {Object.entries(ENTITIES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <button type="button" className="audit-clear" onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {error ? (
        <div className="alert alert-error">
          <span className="alert-icon"><IconAlert /></span>
          {error}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={fetchLogs}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="audit-card">
          <div className="audit-table-scroll">
            <table className="audit-table">
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
                      <div className="audit-empty">
                        <span className="audit-empty-icon"><IconInbox /></span>
                        <p className="audit-empty-title">Sin eventos</p>
                        <p className="audit-empty-text">
                          No se encontraron eventos con los filtros aplicados.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const action = ACTIONS[log.action] || { label: log.action, icon: IconActivity, tone: "gray" };
                    const entity = ENTITIES[log.entity] || { label: log.entity, icon: IconActivity };
                    const ActionIcon = action.icon;
                    const EntityIcon = entity.icon;
                    const details = formatDetails(log.details);
                    const ip = formatIp(log.ip_address);

                    return (
                      <tr key={log.id} className={log.action === "login_failed" ? "audit-row-failed" : ""}>
                        <td>
                          <div className="audit-date">
                            <span className="audit-date-day">{formatDay(log.created_at)}</span>
                            <span className="audit-date-time">
                              <IconClock />
                              {formatTime(log.created_at)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="audit-user">
                            <span className="audit-avatar">{getInitial(log.user_name)}</span>
                            <span className="audit-user-name">{log.user_name || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`audit-badge tone-${action.tone}`}>
                            <ActionIcon />
                            {action.label}
                          </span>
                        </td>
                        <td>
                          <span className="audit-entity">
                            <span className="audit-entity-icon"><EntityIcon /></span>
                            {entity.label}
                          </span>
                        </td>
                        <td className="audit-details">
                          {details || <span className="audit-none">—</span>}
                        </td>
                        <td>
                          {ip ? <span className="audit-ip">{ip}</span> : <span className="audit-none">—</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && meta.total > 0 && (
            <div className="audit-footer">
              <span className="audit-footer-info">
                Mostrando <strong>{rangeStart}–{rangeEnd}</strong> de <strong>{meta.total}</strong> eventos
              </span>

              {meta.totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    aria-label="Página anterior"
                  >
                    <IconChevronLeft />
                  </button>
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
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= meta.totalPages}
                    aria-label="Página siguiente"
                  >
                    <IconChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
