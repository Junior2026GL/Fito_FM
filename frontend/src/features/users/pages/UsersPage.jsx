import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
} from "../services/users.service.js";
import { getModules } from "../services/modules.service.js";

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
    {[200, 160, 80, 100, 70, 90, 110].map((w, i) => (
      <td key={i}><div className="skeleton" style={{ width: w, height: 14 }} /></td>
    ))}
  </tr>
);

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PowerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ModulesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
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

const IconModuleDefault = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const MODULE_ICONS = {
  diputados: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
};

/**
 * Lista de módulos con switches. Si `readOnly` es true, todos aparecen
 * activados y deshabilitados (caso de administradores con acceso total).
 */
const ModulePermissionList = ({ modules, selected, onToggle, readOnly = false }) => (
  <div className="module-permission-list">
    {modules.map((m) => {
      const Icon = MODULE_ICONS[m.key] || IconModuleDefault;
      const checked = readOnly ? true : selected.includes(m.key);
      return (
        <div key={m.key} className={`module-permission-item${readOnly ? " is-readonly" : ""}`}>
          <span className="module-permission-icon"><Icon /></span>
          <div className="module-permission-text">
            <span className="module-permission-title">{m.label}</span>
            <span className="module-permission-desc">{m.description}</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={checked}
              disabled={readOnly}
              onChange={() => onToggle?.(m.key)}
            />
            <span className="toggle-switch-track" />
          </label>
        </div>
      );
    })}
  </div>
);

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Modal crear / editar
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const UserModal = ({ user, modules, onClose, onSaved, onCreated }) => {
  const isEditing = !!user;
  const [form, setForm] = useState(
    isEditing
      ? { name: user.name, username: user.username, email: user.email, password: "", role: user.role, modules: user.modules || [] }
      : { name: "", username: "", email: "", password: "", role: "user", modules: [] }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleToggle = (moduleKey) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(moduleKey)
        ? prev.modules.filter((m) => m !== moduleKey)
        : [...prev.modules, moduleKey]
    }));
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

          {!isEditing && (
            form.role === "admin" ? (
              <div className="form-group">
                <label className="form-label">Módulos</label>
                <span className="form-hint">Los administradores tienen acceso a todos los módulos.</span>
                <ModulePermissionList modules={modules} selected={modules.map((m) => m.key)} readOnly />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Módulos con acceso</label>
                <span className="form-hint">Elige qué secciones podrá ver este usuario al iniciar sesión.</span>
                <ModulePermissionList modules={modules} selected={form.modules} onToggle={handleModuleToggle} />
              </div>
            )
          )}

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

/* ────────────────────────────────────────────────────────────
   Modal asignar módulos
──────────────────────────────────────────────────────────── */
const ModulesModal = ({ user, modules, onClose, onSaved }) => {
  const [selected, setSelected] = useState(user.modules || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = user.role === "admin";

  const handleToggle = (moduleKey) => {
    setSelected((prev) =>
      prev.includes(moduleKey) ? prev.filter((m) => m !== moduleKey) : [...prev, moduleKey]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await updateUser(user.id, {
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        modules: selected
      });
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar los módulos");
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
      aria-labelledby="modules-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="modules-modal-title">Asignar módulos</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modules-modal-user">
            <Avatar name={user.name} />
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">@{user.username}</div>
            </div>
          </div>

          <div className="form-group">
            {isAdmin ? (
              <>
                <span className="form-hint">Los administradores tienen acceso a todos los módulos.</span>
                <ModulePermissionList modules={modules} selected={modules.map((m) => m.key)} readOnly />
              </>
            ) : (
              <>
                <span className="form-hint">Elige qué secciones podrá ver este usuario al iniciar sesión.</span>
                <ModulePermissionList modules={modules} selected={selected} onToggle={handleToggle} />
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || isAdmin}>
              {loading
                ? <><span className="spinner" /> Guardando...</>
                : "Guardar módulos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   Modal confirmación de cambio de estado
──────────────────────────────────────────────────────────── */
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
  const [modules, setModules] = useState([]);

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
  useEffect(() => { getModules().then(setModules).catch(() => {}); }, []);

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

  const handleModulesSaved = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setModal(null);
    showToast("Módulos actualizados correctamente");
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
        <UserModal modules={modules} onClose={() => setModal(null)} onCreated={handleCreated} onSaved={() => {}} />
      )}
      {modal?.type === "edit" && (
        <UserModal user={modal.user} modules={modules} onClose={() => setModal(null)} onSaved={handleSaved} onCreated={() => {}} />
      )}
      {modal?.type === "modules" && (
        <ModulesModal user={modal.user} modules={modules} onClose={() => setModal(null)} onSaved={handleModulesSaved} />
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
                <th>Módulos</th>
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
                  <td colSpan={7}>
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
                      {user.role === "admin" ? (
                        <span className="module-chip module-chip-all">Todos</span>
                      ) : user.modules?.length ? (
                        <div className="module-chip-list">
                          {user.modules.map((key) => (
                            <span key={key} className="module-chip">
                              {modules.find((m) => m.key === key)?.label ?? key}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="module-chip module-chip-empty">Sin acceso</span>
                      )}
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
                          className="action-icon-btn action-icon-edit"
                          onClick={() => setModal({ type: "edit", user })}
                          title="Editar"
                          aria-label={`Editar ${user.name}`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          className="action-icon-btn action-icon-modules"
                          onClick={() => setModal({ type: "modules", user })}
                          title="Asignar módulos"
                          aria-label={`Asignar módulos a ${user.name}`}
                        >
                          <ModulesIcon />
                        </button>
                        <button
                          className={`action-icon-btn ${user.is_active ? "action-icon-danger" : "action-icon-success"}`}
                          onClick={() => setModal({ type: "confirm", user })}
                          title={user.is_active ? "Desactivar" : "Activar"}
                          aria-label={`${user.is_active ? "Desactivar" : "Activar"} ${user.name}`}
                        >
                          {user.is_active ? <PowerIcon /> : <CheckCircleIcon />}
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

