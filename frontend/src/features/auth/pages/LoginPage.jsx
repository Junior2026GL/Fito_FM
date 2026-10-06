import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/auth.service.js";
import { PasswordField, TextField } from "../../../components/DialogFields.jsx";
import { IconAlert, IconLogIn, IconShield, IconUser, IconUsers } from "../../../components/icons.jsx";
import logoGorra from "../../../assets/gorra.PNG";
import mascota from "../../../assets/animado_sin_fondo.png";

const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="20" x2="6" y2="13" />
    <line x1="12" y1="20" x2="12" y2="6" />
    <line x1="18" y1="20" x2="18" y2="10" />
  </svg>
);

const FEATURES = [
  { icon: IconUsers, title: "Gestión más sencilla", text: "Accede a lo que necesitas, de forma rápida y organizada." },
  { icon: IconShield, title: "Información segura", text: "Tus datos siempre protegidos con los más altos estándares." },
  { icon: IconChart, title: "Un equipo más fuerte", text: "Herramientas que impulsan tu crecimiento." }
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loginAction } = useAuth();
  const sessionExpired = searchParams.get("expired") === "1";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir al inicio
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const username = form.username.trim();
    if (!username || !form.password) {
      setError({
        title: "Faltan datos",
        text: !username && !form.password
          ? "Escribe tu usuario y tu contraseña para continuar."
          : !username
            ? "Escribe tu usuario para continuar."
            : "Escribe tu contraseña para continuar."
      });
      return;
    }

    setLoading(true);

    try {
      const result = await login({ ...form, username });
      loginAction(result);
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setError({
          title: "Revisa tus datos",
          text: "El usuario o la contraseña no tienen un formato válido. Verifícalos e inténtalo de nuevo."
        });
      } else if (status === 401) {
        setError({
          title: "No pudimos iniciar tu sesión",
          text: err.response?.data?.message || "Usuario o contraseña incorrectos."
        });
      } else if (!err.response) {
        setError({
          title: "Sin conexión con el servidor",
          text: "Revisa tu conexión a internet e inténtalo de nuevo."
        });
      } else {
        setError({
          title: "No fue posible iniciar sesión",
          text: err.response?.data?.message || "Inténtalo de nuevo en unos minutos."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const year = new Date().getFullYear();

  return (
    <div className="login-layout">
      {/* Lado izquierdo – branding */}
      <aside className="login-brand-side">
        <div className="login-deco login-deco-1" />
        <div className="login-deco login-deco-2" />
        <div className="login-deco login-deco-3" />

        <div className="login-mascot-stage">
          <img className="login-mascot" src={mascota} alt="Mascota La Gorra Azul" />
        </div>

        <div className="login-brand-content">
          <p className="login-brand-kicker">La Gorra Azul</p>
          <h1 className="login-brand-headline">
            Personas que hacen <span>posible más.</span>
          </h1>
          <p className="login-brand-lead">
            Un sistema pensado para nuestro equipo, con herramientas simples, seguras y siempre a tu alcance.
          </p>

          <ul className="login-features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="login-feature-icon"><Icon /></span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>

          <p className="login-brand-tagline">Juntos llegamos más lejos</p>
        </div>
      </aside>

      {/* Lado derecho – formulario */}
      <div className="login-form-side">
        <div className="login-logo-circle">
          <img src={logoGorra} alt="La Gorra Azul" className="login-outer-logo" />
        </div>

        <div className="login-form-box">
          <p className="login-eyebrow">Panel de administración</p>
          <h2 className="login-title">Ingresa al sistema</h2>
          <p className="login-subtitle">Utiliza tus credenciales para continuar.</p>

          {sessionExpired && !error && (
            <div className="dlg-note dlg-note-info login-notice" role="status">
              <IconAlert />
              <span>Tu sesión se cerró o expiró. Inicia sesión nuevamente.</span>
            </div>
          )}

          {error && (
            <div className="login-alert" role="alert">
              <span className="login-alert-icon"><IconAlert /></span>
              <div className="login-alert-body">
                <strong>{error.title}</strong>
                <span>{error.text}</span>
              </div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="username"
              name="username"
              label="Usuario"
              icon={IconUser}
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="tu_usuario"
              autoComplete="username"
              autoFocus
              required
              minLength={3}
            />

            <PasswordField
              id="password"
              name="password"
              label="Contraseña"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              minLength={8}
            />

            <button
              type="submit"
              className="btn btn-primary btn-full login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <IconLogIn />
                </>
              )}
            </button>
          </form>

          <p className="login-help">
            ¿Olvidaste tu contraseña? Contacta al administrador del sistema.
          </p>

          <p className="login-secure">
            <IconShield />
            <span>Acceso exclusivo para personal autorizado de La Gorra Azul.</span>
          </p>
        </div>

        <p className="login-form-foot">© {year} FITO · Todos los derechos reservados</p>
      </div>
    </div>
  );
};
