import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/auth.service.js";
import logoGorra from "../../../assets/gorra.PNG";
import mascota from "../../../assets/animado.PNG";
import seSiente from "../../../assets/se siente.PNG";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginAction } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="login-layout">
      {/* Lado izquierdo – branding */}
      <aside className="login-brand-side">
        <div className="login-deco login-deco-1" />
        <div className="login-deco login-deco-2" />
        <div className="login-deco login-deco-3" />
        {/* Mascota con borde azul oscuro y esquinas redondeadas */}
        <div className="login-mascot-wrapper">
          <img src={mascota} alt="Mascota La Gorra Azul" className="login-brand-mascot" />
        </div>
      </aside>

      {/* Lado derecho – formulario */}
      <div className="login-form-side">
        {/* Logo en círculo */}
        <div className="login-logo-circle">
          <img src={logoGorra} alt="La Gorra Azul" className="login-outer-logo" />
        </div>

        <div className="login-form-box">
          <p className="login-eyebrow">Panel de administración</p>
          <h2 className="login-title">Bienvenido de vuelta</h2>
          <p className="login-subtitle">Ingresa tus credenciales para continuar.</p>

          {error && (
            <div className="alert alert-error" role="alert">
              <span className="alert-icon">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                value={form.username}
                onChange={handleChange}
                placeholder="tu_usuario"
                autoComplete="username"
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <div className="form-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="form-input-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

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
                "Iniciar sesión"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
