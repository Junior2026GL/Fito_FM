import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword
} from "../services/users.service.js";
import { getModules } from "../services/modules.service.js";
import { TablePagination } from "../../../components/TablePagination.jsx";
import { Dialog, DialogError, DialogSection } from "../../../components/Dialog.jsx";
import {
  PasswordField,
  PasswordMatch,
  PasswordStrength,
  TextField
} from "../../../components/DialogFields.jsx";
import {
  IconActivity,
  IconAlert,
  IconAuditoria,
  IconBan,
  IconBriefcase,
  IconCheck,
  IconCity,
  IconCopy,
  IconDashboard,
  IconEdit,
  IconFilter,
  IconGrid,
  IconInbox,
  IconKey,
  IconMail,
  IconMap,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconPower,
  IconRefresh,
  IconSearch,
  IconShield,
  IconUser,
  IconUsers
} from "../../../components/icons.jsx";

const PAGE_SIZE = 20;

const ROLES = {
  admin: { label: "Administrador", description: "Acceso total al sistema", icon: IconShield, tone: "blue" },
  user: { label: "Usuario", description: "Solo los módulos asignados", icon: IconUser, tone: "gray" }
};

const MODULE_ICONS = {
  dashboard: IconDashboard,
  auditoria: IconAuditoria,
  diputados: IconMap,
  distrito_central: IconCity
};

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";

/** Contraseña aleatoria de 14 caracteres con generador criptográfico del navegador. */
const generatePassword = (length = 14) => {
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (v) => PASSWORD_CHARS[v % PASSWORD_CHARS.length]).join("");
};

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const formatDate = (d) =>
  new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

/* ────────────────────────────────────────────────────────────
   Piezas reutilizables
──────────────────────────────────────────────────────────── */
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
    {[190, 150, 170, 110, 80, 90, 130].map((w, i) => (
      <td key={i}><div className="skeleton" style={{ width: w, height: 14 }} /></td>
    ))}
  </tr>
);

const RoleBadge = ({ role }) => {
  const info = ROLES[role] || { label: role, icon: IconUser, tone: "gray" };
  const Icon = info.icon;
  return (
    <span className={`dt-badge tone-${info.tone}`}>
      <Icon />
      {info.label}
    </span>
  );
};

const UserCard = ({ user }) => (
  <div className="dlg-user-card">
    <span className="dt-avatar">{getInitials(user.name)}</span>
    <div className="dlg-user-card-info">
      <span className="dt-user-name">{user.name}</span>
      <span className="dt-user-sub">@{user.username}</span>
    </div>
    <RoleBadge role={user.role} />
  </div>
);

/**
 * Lista de módulos con switches. Si `readOnly` es true, todos aparecen
 * activados y deshabilitados (caso de administradores con acceso total).
 */
const ModulePermissionList = ({ modules, selected, onToggle, readOnly = false }) => (
  <div className="module-permission-list">
    {modules.map((m) => {
      const Icon = MODULE_ICONS[m.key] || IconGrid;
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

/* ────────────────────────────────────────────────────────────
   Modal crear / editar
──────────────────────────────────────────────────────────── */
const UserModal = ({ user, onClose, onSaved, onCreated }) => {
  const isEditing = !!user;
  const [form, setForm] = useState(
    isEditing
      ? {
          name: user.name,
          username: user.username,
          email: user.email,
          job_title: user.job_title || "",
          phone: user.phone || "",
          city: user.city || "",
          password: "",
          role: user.role,
          modules: user.modules || []
        }
      : { name: "", username: "", email: "", job_title: "", phone: "", city: "", password: "", role: "user", modules: [] }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name } = e.target;
    // El teléfono solo admite números, espacios, +, - y paréntesis
    const value = name === "phone" ? e.target.value.replace(/[^0-9+()\-\s]/g, "") : e.target.value;
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

  return (
    <Dialog
      icon={isEditing ? IconEdit : IconPlus}
      title={isEditing ? "Editar usuario" : "Nuevo usuario"}
      subtitle={isEditing ? `@${user.username}` : "Completa los datos de la nueva cuenta"}
      size="lg"
      onClose={onClose}
    >
      <form className="dlg-form" onSubmit={handleSubmit}>
        <div className="dlg-body">
          <DialogError message={error} />

          <DialogSection>Datos personales</DialogSection>
          <div className="dlg-row-2">
            <TextField id="m-name" name="name" label="Nombre completo" icon={IconUser}
              type="text" value={form.name} onChange={handleChange} required
              minLength={2} maxLength={120} placeholder="Juan Pérez" />
            <TextField id="m-username" name="username" label="Usuario" icon={IconUsers}
              type="text" value={form.username} onChange={handleChange} required
              minLength={3} maxLength={80} pattern="[a-zA-Z0-9_\-]+"
              title="Solo letras, números, _ y -" placeholder="juan_perez" />
          </div>

          <div className="dlg-row-2">
            <TextField id="m-email" name="email" label="Correo electrónico" icon={IconMail}
              type="email" value={form.email} onChange={handleChange} required
              maxLength={160} placeholder="juan@ejemplo.com" />
            <TextField id="m-phone" name="phone" label="Teléfono" icon={IconPhone}
              type="tel" value={form.phone} onChange={handleChange}
              maxLength={30} inputMode="tel" placeholder="+504 9999-9999" />
          </div>

          <DialogSection>Cargo y ubicación</DialogSection>
          <div className="dlg-row-2">
            <TextField id="m-job" name="job_title" label="Cargo" icon={IconBriefcase}
              type="text" value={form.job_title} onChange={handleChange}
              maxLength={100} placeholder="Coordinador" />
            <TextField id="m-city" name="city" label="Ciudad" icon={IconMapPin}
              type="text" value={form.city} onChange={handleChange}
              maxLength={100} placeholder="Tegucigalpa" />
          </div>

          {!isEditing && (
            <>
              <DialogSection>Acceso</DialogSection>
              <PasswordField id="m-password" name="password" label="Contraseña"
                value={form.password} onChange={handleChange} minLength={8}
                hint={<PasswordStrength password={form.password} />} />
            </>
          )}

          <DialogSection>Rol y permisos</DialogSection>
          <div className="dlg-segment" role="radiogroup" aria-label="Rol">
            {Object.entries(ROLES).map(([value, { label, description, icon: Icon }]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={form.role === value}
                className={`dlg-segment-item${form.role === value ? " active" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, role: value }))}
              >
                <Icon />
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </button>
            ))}
          </div>

          {!isEditing && (
            <div className="dlg-note dlg-note-info">
              <IconGrid />
              <span>
                {form.role === "admin"
                  ? "Los administradores tienen acceso a todos los módulos."
                  : "Después de crear el usuario, asigna sus módulos con el botón de módulos de la tabla."}
              </span>
            </div>
          )}
        </div>

        <div className="dlg-footer">
          <button type="button" className="dlg-btn dlg-btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="dlg-btn dlg-btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner" /> Guardando...</>
              : isEditing ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </form>
    </Dialog>
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

  return (
    <Dialog
      icon={IconGrid}
      title="Asignar módulos"
      subtitle="Define a qué secciones puede acceder"
      onClose={onClose}
    >
      <form className="dlg-form" onSubmit={handleSubmit}>
        <div className="dlg-body">
          <DialogError message={error} />
          <UserCard user={user} />

          <div className="dlg-field">
            <span className="dlg-hint">
              {isAdmin
                ? "Los administradores tienen acceso a todos los módulos."
                : "Elige qué secciones podrá ver este usuario al iniciar sesión."}
            </span>
            {isAdmin ? (
              <ModulePermissionList modules={modules} selected={modules.map((m) => m.key)} readOnly />
            ) : (
              <ModulePermissionList modules={modules} selected={selected} onToggle={handleToggle} />
            )}
          </div>
        </div>

        <div className="dlg-footer">
          <button type="button" className="dlg-btn dlg-btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="dlg-btn dlg-btn-primary" disabled={loading || isAdmin}>
            {loading
              ? <><span className="spinner" /> Guardando...</>
              : "Guardar módulos"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

/* ────────────────────────────────────────────────────────────
   Modal restablecer contraseña
──────────────────────────────────────────────────────────── */
const ResetPasswordModal = ({ user, onClose, onDone }) => {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    const generated = generatePassword();
    setPassword(generated);
    setConfirmation(generated);
    setRevealed(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setError("No se pudo copiar. Selecciona la contraseña y cópiala manualmente.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmation) {
      setError("La confirmación no coincide con la nueva contraseña");
      return;
    }

    setLoading(true);
    try {
      await resetUserPassword(user.id, password);
      onDone(user);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo restablecer la contraseña");
      setLoading(false);
    }
  };

  return (
    <Dialog
      icon={IconKey}
      title="Cambiar contraseña"
      subtitle="Define una nueva contraseña para este usuario"
      onClose={onClose}
    >
      <form className="dlg-form" onSubmit={handleSubmit}>
        <div className="dlg-body">
          <DialogError message={error} />
          <UserCard user={user} />

          <PasswordField
            id="rp-new"
            name="password"
            label="Nueva contraseña"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setCopied(false); }}
            forceVisible={revealed}
            autoFocus
            minLength={8}
            hint={<PasswordStrength password={password} />}
          />

          <PasswordField
            id="rp-confirm"
            name="confirmation"
            label="Confirmar contraseña"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            forceVisible={revealed}
            minLength={8}
            hint={<PasswordMatch password={password} confirmation={confirmation} />}
          />

          <div className="dlg-tools">
            <button type="button" className="dlg-link-btn" onClick={handleGenerate}>
              <IconRefresh />
              Generar contraseña segura
            </button>
            {revealed && password && (
              <button type="button" className="dlg-link-btn" onClick={handleCopy}>
                {copied ? <IconCheck /> : <IconCopy />}
                {copied ? "Copiada" : "Copiar"}
              </button>
            )}
          </div>

          <div className="dlg-note">
            <IconAlert />
            <span>
              Comparte la nueva contraseña con el usuario de forma segura. Se pedirá
              en su próximo inicio de sesión.
            </span>
          </div>
        </div>

        <div className="dlg-footer">
          <button type="button" className="dlg-btn dlg-btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="dlg-btn dlg-btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner" /> Guardando...</>
              : "Guardar contraseña"}
          </button>
        </div>
      </form>
    </Dialog>
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

  return (
    <Dialog
      icon={deactivating ? IconPower : IconCheck}
      title={deactivating ? "Desactivar usuario" : "Activar usuario"}
      subtitle={`@${user.username}`}
      size="sm"
      onClose={onClose}
    >
      <div className="dlg-body dlg-confirm-body">
        <span className={`dlg-confirm-icon ${deactivating ? "danger" : "success"}`}>
          {deactivating ? <IconBan /> : <IconCheck />}
        </span>
        <p className="dlg-confirm-text">
          {deactivating
            ? <><strong>{user.name}</strong> no podrá iniciar sesión hasta que sea reactivado.</>
            : <><strong>{user.name}</strong> podrá iniciar sesión nuevamente.</>}
        </p>
      </div>

      <div className="dlg-footer">
        <button type="button" className="dlg-btn dlg-btn-secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          type="button"
          className={`dlg-btn ${deactivating ? "dlg-btn-danger" : "dlg-btn-success"}`}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading
            ? <><span className="spinner" /> Procesando...</>
            : deactivating ? "Sí, desactivar" : "Sí, activar"}
        </button>
      </div>
    </Dialog>
  );
};

/* ────────────────────────────────────────────────────────────
   Página principal
──────────────────────────────────────────────────────────── */
export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1, stats: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState([]);

  const [searchInput, setSearchInput] = useState("");
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
      const result = await getUsers({ page, limit: PAGE_SIZE, search, role: roleFilter, active: activeFilter });
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
  useEffect(() => () => {
    clearTimeout(searchTimer.current);
    clearTimeout(toastTimer.current);
  }, []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 380);
  };

  const hasFilters = Boolean(searchInput || roleFilter || activeFilter);

  const clearFilters = () => {
    clearTimeout(searchTimer.current);
    setSearchInput("");
    setSearch("");
    setRoleFilter("");
    setActiveFilter("");
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

  const handlePasswordReset = (user) => {
    setModal(null);
    showToast(`Contraseña de ${user.name} restablecida correctamente`);
  };

  const { stats } = meta;
  const closeModal = () => setModal(null);

  return (
    <>
      {toast && <div className="toast" role="status">{toast}</div>}

      {modal?.type === "create" && (
        <UserModal onClose={closeModal} onCreated={handleCreated} onSaved={() => {}} />
      )}
      {modal?.type === "edit" && (
        <UserModal user={modal.user} onClose={closeModal} onSaved={handleSaved} onCreated={() => {}} />
      )}
      {modal?.type === "modules" && (
        <ModulesModal user={modal.user} modules={modules} onClose={closeModal} onSaved={handleModulesSaved} />
      )}
      {modal?.type === "password" && (
        <ResetPasswordModal user={modal.user} onClose={closeModal} onDone={handlePasswordReset} />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal user={modal.user} onClose={closeModal} onConfirm={handleToggleConfirm} />
      )}

      {/* Encabezado */}
      <div className="dt-header">
        <div className="dt-header-main">
          <span className="dt-header-icon"><IconUsers /></span>
          <div>
            <h1 className="page-title">Usuarios</h1>
            <p className="page-subtitle">Gestión de cuentas y permisos de acceso</p>
          </div>
        </div>
        <div className="dt-header-actions">
          <span className="page-chip">
            {meta.total} usuario{meta.total !== 1 ? "s" : ""}
          </span>
          <button type="button" className="btn btn-primary" onClick={() => setModal({ type: "create" })}>
            <IconPlus />
            Nuevo usuario
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="stats-row">
          <StatCard label="Total registrados" value={stats.total} color="#0e2460" icon={<IconUsers />} />
          <StatCard label="Activos" value={stats.active} color="#15803d" icon={<IconCheck />} />
          <StatCard label="Inactivos" value={stats.inactive} color="#64748b" icon={<IconBan />} />
          <StatCard label="Administradores" value={stats.admins} color="#1d4ed8" icon={<IconShield />} />
        </div>
      )}

      {/* Filtros */}
      <div className="dt-toolbar">
        <label className="dt-search">
          <IconSearch />
          <input
            type="search"
            placeholder="Buscar por nombre, usuario, correo, cargo o ciudad..."
            value={searchInput}
            onChange={handleSearchInput}
          />
        </label>

        <label className="dt-select">
          <IconFilter />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filtrar por rol">
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
        </label>

        <label className="dt-select">
          <IconActivity />
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} aria-label="Filtrar por estado">
            <option value="">Cualquier estado</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </select>
        </label>

        {hasFilters && (
          <button type="button" className="dt-clear" onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {error ? (
        <div className="alert alert-error">
          <span className="alert-icon"><IconAlert /></span>
          {error}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={fetchUsers}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="dt-card">
          <div className="dt-table-scroll">
            <table className="dt-table dt-table-wide">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Cargo</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="dt-empty">
                        <span className="dt-empty-icon"><IconInbox /></span>
                        <p className="dt-empty-title">Sin usuarios</p>
                        <p className="dt-empty-text">
                          No se encontraron usuarios con los filtros aplicados.
                        </p>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal({ type: "create" })}>
                          <IconPlus />
                          Crear usuario
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className={user.is_active ? "" : "dt-row-inactive"}>
                      <td>
                        <div className="dt-user">
                          <span className="dt-avatar">{getInitials(user.name)}</span>
                          <div className="dt-user-info">
                            <span className="dt-user-name">{user.name}</span>
                            <span className="dt-user-sub">@{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.job_title || user.city ? (
                          <div className="dt-stack">
                            {user.job_title && <span className="dt-stack-main">{user.job_title}</span>}
                            {user.city && (
                              <span className="dt-stack-sub">
                                <IconMapPin />
                                {user.city}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="dt-none">—</span>
                        )}
                      </td>
                      <td>
                        <div className="dt-stack">
                          <span className="dt-stack-main dt-email">{user.email}</span>
                          {user.phone && (
                            <span className="dt-stack-sub">
                              <IconPhone />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><RoleBadge role={user.role} /></td>
                      <td>
                        <span className={`dt-badge ${user.is_active ? "tone-green" : "tone-gray"}`}>
                          <span className="dt-dot" />
                          {user.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="dt-muted">{formatDate(user.created_at)}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="action-icon-btn action-icon-edit"
                            onClick={() => setModal({ type: "edit", user })}
                            title="Editar"
                            aria-label={`Editar ${user.name}`}
                          >
                            <IconEdit />
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn action-icon-modules"
                            onClick={() => setModal({ type: "modules", user })}
                            title="Asignar módulos"
                            aria-label={`Asignar módulos a ${user.name}`}
                          >
                            <IconGrid />
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn action-icon-key"
                            onClick={() => setModal({ type: "password", user })}
                            title="Cambiar contraseña"
                            aria-label={`Cambiar contraseña de ${user.name}`}
                          >
                            <IconKey />
                          </button>
                          <button
                            type="button"
                            className={`action-icon-btn ${user.is_active ? "action-icon-danger" : "action-icon-success"}`}
                            onClick={() => setModal({ type: "confirm", user })}
                            title={user.is_active ? "Desactivar" : "Activar"}
                            aria-label={`${user.is_active ? "Desactivar" : "Activar"} ${user.name}`}
                          >
                            {user.is_active ? <IconPower /> : <IconCheck />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && (
            <TablePagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              itemLabel="usuarios"
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </>
  );
};
