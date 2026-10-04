import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext.jsx";
import { hasModuleAccess } from "../config/modules.js";
import {
  IconHome, IconUsers, IconMap, IconDashboard, IconAuditoria, IconLogout,
  IconKey, IconChevronDown
} from "../components/icons.jsx";
import { ChangePasswordModal } from "../components/ChangePasswordModal.jsx";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

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
          <div className="topbar-menu" ref={menuRef}>
            <button
              type="button"
              className="topbar-user"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="topbar-avatar">{initials}</span>
              <span className="topbar-user-info">
                <span className="topbar-user-name">{user?.name}</span>
                <span className="topbar-user-role">
                  {user?.role === "admin" ? "Administrador" : "Usuario"}
                </span>
              </span>
              <span className={`topbar-chevron${menuOpen ? " open" : ""}`}>
                <IconChevronDown />
              </span>
            </button>

            {menuOpen && (
              <div className="topbar-dropdown" role="menu">
                <button
                  type="button"
                  className="topbar-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setPasswordModalOpen(true);
                  }}
                >
                  <IconKey />
                  Cambiar contraseña
                </button>
                <button
                  type="button"
                  className="topbar-dropdown-item danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <IconLogout />
                  Salir
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── CONTENT ── */}
        <main className="page-content">
          <div className="page-container">
            <Outlet />
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="app-footer">
          <div className="app-footer-brand">
            <img src={gorraLogo} alt="" className="app-footer-logo" />
            <span>
              © {new Date().getFullYear()} <strong>FITO</strong> · Todos los derechos reservados
            </span>
          </div>
        </footer>
      </div>

      {passwordModalOpen && (
        <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />
      )}
    </div>
  );
};
