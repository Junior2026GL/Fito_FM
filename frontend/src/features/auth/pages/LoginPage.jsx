import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/auth.service.js";
import { DialogError } from "../../../components/Dialog.jsx";
import { PasswordField, TextField } from "../../../components/DialogFields.jsx";
import { IconAlert, IconCheck, IconLogIn, IconMap, IconUser, IconUsers } from "../../../components/icons.jsx";
import logoGorra from "../../../assets/gorra.PNG";
import mascota from "../../../assets/animado.PNG";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loginAction } = useAuth();
  const sessionExpired = searchParams.get("expired") === "1";

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
    <div className="lg">
      <div className="lg-bg" aria-hidden="true">
        <span className="lg-blob lg-blob-1" />
        <span className="lg-blob lg-blob-2" />
      </div>

      {/* Lado izquierdo – mascota */}
      <aside className="lg-hero">
        <div className="lg-arch-wrap">
          <span className="lg-chip lg-chip-1"><IconMap /> Municipios</span>
          <span className="lg-chip lg-chip-2"><IconUsers /> Carga electoral</span>
          <span className="lg-chip lg-chip-3"><IconCheck /> Urnas y centros</span>

          <div className="lg-arch">
            <img src={mascota} alt="Mascota La Gorra Azul" />
            <div className="lg-arch-caption">
              <h2 className="lg-arch-title">Resultados electorales en un solo lugar</h2>
              <p className="lg-arch-text">Consulta, compara y sigue cada municipio.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Lado derecho – formulario */}
      <main className="lg-panel">
        <div className="lg-card">
          <header className="lg-card-head">
            <div className="lg-logo">
              <img src={logoGorra} alt="La Gorra Azul" />
            </div>
            <p className="lg-eyebrow">Panel de administración</p>
            <h1 className="lg-title">Acceso al sistema</h1>
            <p className="lg-subtitle">Ingresa tus credenciales para continuar.</p>
          </header>

          {sessionExpired && !error && (
            <div className="dlg-note dlg-note-info login-notice" role="status">
              <IconAlert />
              <span>Tu sesión se cerró o expiró. Inicia sesión nuevamente.</span>
            </div>
          )}

          <DialogError message={error} />

          <form className="lg-form" onSubmit={handleSubmit} noValidate>
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
              className="btn btn-primary btn-full lg-submit"
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

          <p className="lg-help">
            ¿Olvidaste tu contraseña? Contacta al administrador del sistema.
          </p>
        </div>

        <p className="lg-foot">© {year} FITO · Todos los derechos reservados</p>
      </main>
    </div>
  );
};
