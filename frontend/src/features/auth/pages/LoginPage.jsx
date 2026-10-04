import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/auth.service.js";
import { DialogError } from "../../../components/Dialog.jsx";
import { PasswordField, TextField } from "../../../components/DialogFields.jsx";
import { IconAuditoria, IconLogIn, IconMap, IconUser } from "../../../components/icons.jsx";
import logoGorra from "../../../assets/gorra.PNG";
import mascota from "../../../assets/animado.PNG";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginAction } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir al inicio
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form);
      loginAction(result);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "No fue posible iniciar sesión"
      );
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

        <div className="login-brand-top">
          <span className="login-brand-mark">
            <img src={logoGorra} alt="" />
          </span>
          <span className="login-brand-name">FITO</span>
        </div>

        <div className="login-mascot-stage">
          <div className="login-mascot-card">
            <img src={mascota} alt="Mascota La Gorra Azul" />
          </div>

          <div className="login-chip login-chip-1">
            <span className="login-chip-icon"><IconMap /></span>
            Resultados por municipio
          </div>
          <div className="login-chip login-chip-2">
            <span className="login-chip-icon"><IconAuditoria /></span>
            Auditoría del sistema
          </div>
        </div>

        <div className="login-brand-copy">
          <h1 className="login-brand-title">La Gorra Azul</h1>
          <p className="login-brand-text">Plataforma de gestión y resultados electorales</p>
        </div>
      </aside>

      {/* Lado derecho – formulario */}
      <div className="login-form-side">
        <div className="login-logo-circle">
          <img src={logoGorra} alt="La Gorra Azul" className="login-outer-logo" />
        </div>

        <div className="login-form-box">
          <p className="login-eyebrow">Panel de administración</p>
          <h2 className="login-title">Bienvenido de vuelta</h2>
          <p className="login-subtitle">Ingresa tus credenciales para continuar.</p>

          <DialogError message={error} />

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
        </div>

        <p className="login-form-foot">© {year} FITO · Todos los derechos reservados</p>
      </div>
    </div>
  );
};
