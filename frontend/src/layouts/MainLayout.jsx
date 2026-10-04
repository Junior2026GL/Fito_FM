import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext.jsx";
import { hasModuleAccess } from "../config/modules.js";
import {
  IconHome, IconUsers, IconMap, IconDashboard, IconAuditoria, IconLogout
} from "../components/icons.jsx";
import gorraLogo from "../assets/gorra.PNG";

const PAGE_TITLES = {
  "/": "Inicio",
  "/dashboard": "Dashboard",
  "/diputados": "Diputados Elecciones Generales 2025",
  "/auditoria": "Auditoría",
  "/usuarios": "Usuarios"
};

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] ?? "Panel de administración";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-circle">
            <img src={gorraLogo} alt="fito_fm" className="sidebar-brand-logo" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">Menú</div>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <span className="sidebar-icon"><IconHome /></span>
            <span className="sidebar-label">Inicio</span>
          </NavLink>

          {hasModuleAccess(user, "dashboard") && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-icon"><IconDashboard /></span>
              <span className="sidebar-label">Dashboard</span>
            </NavLink>
          )}

          {hasModuleAccess(user, "diputados") && (
            <NavLink
              to="/diputados"
              title="Diputados Elecciones Generales 2025"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-icon"><IconMap /></span>
              <span className="sidebar-label">Diputados Elecciones Generales 2025</span>
            </NavLink>
          )}

          {hasModuleAccess(user, "auditoria") && (
            <NavLink
              to="/auditoria"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-icon"><IconAuditoria /></span>
              <span className="sidebar-label">Auditoría</span>
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-icon"><IconUsers /></span>
              <span className="sidebar-label">Usuarios</span>
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="app-main">
        {/* ── HEADER ── */}
        <header className="topbar">
          <div className="topbar-title">
            <span className="topbar-eyebrow">Panel de administración</span>
            <span className="topbar-page">{pageTitle}</span>
          </div>
          <div className="topbar-user">
            <div className="topbar-avatar">{initials}</div>
            <div className="topbar-user-info">
              <div className="topbar-user-name">{user?.name}</div>
              <div className="topbar-user-role">
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </div>
            </div>
          </div>
          <button className="topbar-logout" onClick={handleLogout} title="Cerrar sesión">
            <IconLogout />
            <span>Salir</span>
          </button>
        </header>

        {/* ── CONTENT ── */}
        <main className="page-content">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
