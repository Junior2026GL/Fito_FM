import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext.jsx";

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      <header className="topbar">
        <NavLink to="/" className="brand">
          fito_fm
        </NavLink>

        <nav className="topbar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Inicio
          </NavLink>

          {user?.role === "admin" && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="topbar-user">
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role === "admin" ? "Administrador" : "Usuario"}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
};
