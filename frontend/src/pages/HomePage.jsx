import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext.jsx";
import { hasModuleAccess } from "../config/modules.js";
import {
  IconDashboard,
  IconMap,
  IconAuditoria,
  IconUsers
} from "../components/icons.jsx";

const MODULES = [
  {
    to: "/dashboard",
    key: "dashboard",
    icon: IconDashboard,
    title: "Dashboard",
    description: "Indicadores y resumen general del sistema."
  },
  {
    to: "/diputados",
    key: "diputados",
    icon: IconMap,
    title: "Diputados 2025",
    description: "Resultados por municipio de las Elecciones Generales 2025."
  },
  {
    to: "/auditoria",
    key: "auditoria",
    icon: IconAuditoria,
    title: "Auditoría",
    description: "Bitácora de accesos y acciones realizadas en el sistema."
  },
  {
    to: "/usuarios",
    adminOnly: true,
    icon: IconUsers,
    title: "Usuarios",
    description: "Administración de usuarios, roles y permisos por módulo."
  }
];

const formatToday = () => {
  const text = new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const HomePage = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  const available = MODULES.filter((m) =>
    m.adminOnly ? user?.role === "admin" : hasModuleAccess(user, m.key)
  );

  return (
    <>
      <section className="home-hero">
        <div>
          <p className="home-hero-eyebrow">Panel principal</p>
          <h1 className="home-hero-title">Bienvenido, {firstName}</h1>
          <p className="home-hero-text">
            Accede a los módulos disponibles para tu cuenta desde aquí o desde
            el menú lateral.
          </p>
        </div>
        <div className="home-hero-date">{formatToday()}</div>
      </section>

      <h2 className="home-section-title">Accesos rápidos</h2>
      <div className="home-grid">
        {available.map(({ to, icon: Icon, title, description }) => (
          <Link key={to} to={to} className="home-card">
            <span className="home-card-icon">
              <Icon />
            </span>
            <span className="home-card-body">
              <span className="home-card-title">{title}</span>
              <span className="home-card-text">{description}</span>
            </span>
            <span className="home-card-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </>
  );
};
