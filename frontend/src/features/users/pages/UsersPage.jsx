import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
} from "../services/users.service.js";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Constantes
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ROLE_LABEL = { admin: "Administrador", user: "Usuario" };

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Utilidades pequeñas
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Avatar = ({ name }) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return <div className="user-avatar">{initials}</div>;
};

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ background: color + "18", color }}>
      {icon}
    </div>
    <div className="stat-card-body">
      <div className="stat-value" style={{ color }}>{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr>
    {[200, 160, 80, 70, 90, 110].map((w, i) => (
      <td key={i}><div className="skeleton" style={{ width: w, height: 14 }} /></td>
    ))}
  </tr>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const PasswordField = ({ id, name, value, onChange, required = false }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-input-wrapper">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder="--------"
        required={required}
        minLength={8}
        autoComplete="new-password"
      />
      <button
        type="button"
        className="form-input-eye"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        aria-label={show ? "Ocultar" : "Mostrar"}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Modal crear / editar
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const UserModal = ({ user, onClose, onSaved, onCreated }) => {
  const isEditing = !!user;
  const [form, setForm] = useState(
    isEditing
      ? { name: user.name, username: user.username, email: user.email, password: "", role: user.role }
      : { name: "", username: "", email: "", password: "", role: "user" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEditing) {
        const { password, ...data } = form;
        const res = await updateUser(user.id, data);
        onSaved(res.data);
      } else {
        const res = await createUser(form);
        onCreated(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {isEditing ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="m-name">Nombre completo</label>
              <input id="m-name" name="name" type="text" className="form-input"
                value={form.name} onChange={handleChange} required
                minLength={2} maxLength={120} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="m-username">Usuario</label>
              <input id="m-username" name="username" type="text" className="form-input"
                value={form.username} onChange={handleChange} required
                minLength={3} maxLength={80}
                pattern="[a-zA-Z0-9_-]+" title="Solo letras, números, _ y -"
                placeholder="juan_perez" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="m-email">Correo electrónico</label>
            <input id="m-email" name="email" type="email" className="form-input"
              value={form.email} onChange={handleChange} required
              maxLength={160} placeholder="juan@ejemplo.com" />
          </div>

          {!isEditing && (
            <div className="form-group">
              <label className="form-label" htmlFor="m-password">Contraseña</label>
              <PasswordField id="m-password" name="password" value={form.password}
                onChange={handleChange} required />
              <span className="form-hint">Mínimo 8 caracteres</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="m-role">Rol</label>
            <select id="m-role" name="role" className="select-input"
              value={form.role} onChange={handleChange}>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Guardando...</>
                : isEditing ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Modal confirmación de cambio de estado
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ConfirmModal = ({ user, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const deactivating = user.is_active;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">
            {deactivating ? "Desactivar usuario" : "Activar usuario"}
          </h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="confirm-body">
          <div className={`confirm-icon ${deactivating ? "confirm-icon-danger" : "confirm-icon-success"}`}>
            {deactivating
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <p className="confirm-text">
            {deactivating
              ? <><b>{user.name}</b> no podrá iniciar sesión hasta que sea reactivado.</>
              : <><b>{user.name}</b> podrá iniciar sesión nuevamente.</>}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button
            className={`btn ${deactivating ? "btn-danger-solid" : "btn-success-solid"}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" /> Procesando...</>
              : deactivating ? "Sí, desactivar" : "Sí, activar"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Página principal
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1, stats: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const searchTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getUsers({ page, limit: 20, search, role: roleFilter, active: activeFilter });
      setUsers(result.data);
      setMeta(result.meta);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter, activeFilter]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 380);
  };

  const handleToggleConfirm = async () => {
    const user = modal.user;
    try {
      const result = await toggleUserStatus(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? result.data : u)));
      setMeta((prev) =>
        prev.stats
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                active: result.data.is_active ? prev.stats.active + 1 : prev.stats.active - 1,
                inactive: result.data.is_active ? prev.stats.inactive - 1 : prev.stats.inactive + 1
              }
            }
          : prev
      );
      showToast(result.message);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al cambiar el estado");
    } finally {
      setModal(null);
    }
  };

  const handleSaved = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setModal(null);
    showToast("Usuario actualizado correctamente");
  };

  const handleCreated = () => {
    setModal(null);
    fetchUsers();
    showToast("Usuario creado correctamente");
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

  const { stats } = meta;

  return (
    <>
      {toast && <div className="toast" role="status">{toast}</div>}

      {modal?.type === "create" && (
        <UserModal onClose={() => setModal(null)} onCreated={handleCreated} onSaved={() => {}} />
      )}
      {modal?.type === "edit" && (
        <UserModal user={modal.user} onClose={() => setModal(null)} onSaved={handleSaved} onCreated={() => {}} />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal user={modal.user} onClose={() => setModal(null)} onConfirm={handleToggleConfirm} />
      )}

      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestión de cuentas y permisos de acceso</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: "create" })}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nuevo usuario
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-row">
          <StatCard label="Total registrados" value={stats.total} color="#0f172a"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard label="Activos" value={stats.active} color="#15803d"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          />
          <StatCard label="Inactivos" value={stats.inactive} color="#64748b"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
          />
          <StatCard label="Administradores" value={stats.admins} color="#1d4ed8"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por nombre, usuario o correo..."
          onChange={handleSearchInput}
        />
        <select className="select-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
        </select>
        <select className="select-filter" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="">Cualquier estado</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      {error ? (
        <div className="alert alert-error">
          <span className="alert-icon">!</span>
          {error}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={fetchUsers}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre / Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">ðŸ‘¥</div>
                      <p className="empty-state-title">Sin usuarios</p>
                      <p className="empty-state-desc">
                        No se encontraron usuarios con los filtros aplicados.
                      </p>
                      <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: "create" })}>
                        + Crear usuario
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-badge">
                        <Avatar name={user.name} />
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-role">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? "badge-active" : "badge-inactive"}`}>
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(user.created_at)}</td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setModal({ type: "edit", user })}
                        >
                          Editar
                        </button>
                        <button
                          className={`btn btn-sm ${user.is_active ? "btn-danger" : "btn-success"}`}
                          onClick={() => setModal({ type: "confirm", user })}
                        >
                          {user.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && meta.totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Página {meta.page} de {meta.totalPages} â€” {meta.total} resultado{meta.total !== 1 ? "s" : ""}
              </span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>â€¹</button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("â€¦");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "â€¦" ? (
                      <span key={`e${i}`} className="page-ellipsis">â€¦</span>
                    ) : (
                      <button key={p} className={`page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>
                        {p}
                      </button>
                    )
                  )}
                <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>â€º</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

