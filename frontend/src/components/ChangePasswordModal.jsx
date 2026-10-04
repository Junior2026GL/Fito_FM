import { useEffect, useState } from "react";
import { changePassword } from "../features/auth/services/auth.service.js";
import {
  IconAlert,
  IconCheckCircle,
  IconClose,
  IconEye,
  IconEyeOff,
  IconLock,
  IconShield
} from "./icons.jsx";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

const STRENGTH_LEVELS = [
  { label: "Muy débil", className: "weak" },
  { label: "Débil", className: "weak" },
  { label: "Media", className: "medium" },
  { label: "Fuerte", className: "strong" },
  { label: "Muy fuerte", className: "strong" }
];

const STRENGTH_BARS = [1, 1, 2, 3, 4];

const getStrength =(password) => {
  if (!password) return -1;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
};

const PasswordField = ({ id, name, label, value, onChange, autoComplete, autoFocus, hint }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="pw-field">
      <label className="pw-label" htmlFor={id}>{label}</label>
      <div className="pw-input-wrap">
        <span className="pw-input-icon"><IconLock /></span>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className="pw-input"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
        />
        <button
          type="button"
          className="pw-input-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          tabIndex={-1}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {hint}
    </div>
  );
};

export const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("La confirmación no coincide con la nueva contraseña");
      return;
    }

    setSaving(true);

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  const strength = getStrength(form.newPassword);
  const strengthInfo = strength >= 0 ? STRENGTH_LEVELS[strength] : null;
  const confirmFilled = form.confirmPassword.length > 0;
  const confirmMatches = confirmFilled && form.confirmPassword === form.newPassword;

  return (
    <div
      className="pw-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="pw-modal">
        <header className="pw-header">
          <span className="pw-header-icon"><IconShield /></span>
          <div className="pw-header-text">
            <h2 className="pw-title" id="change-password-title">Cambiar contraseña</h2>
            <p className="pw-subtitle">Protege tu cuenta con una contraseña segura</p>
          </div>
          <button type="button" className="pw-close" onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>

        {success ? (
          <div className="pw-body pw-success">
            <span className="pw-success-icon"><IconCheckCircle /></span>
            <h3 className="pw-success-title">Contraseña actualizada</h3>
            <p className="pw-success-text">
              Tu contraseña se cambió correctamente. Úsala la próxima vez que inicies sesión.
            </p>
            <button type="button" className="pw-btn pw-btn-primary" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : (
          <form className="pw-body" onSubmit={handleSubmit}>
            {error && (
              <div className="pw-alert" role="alert">
                <IconAlert />
                <span>{error}</span>
              </div>
            )}

            <PasswordField
              id="cp-current"
              name="currentPassword"
              label="Contraseña actual"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              autoFocus
            />

            <PasswordField
              id="cp-new"
              name="newPassword"
              label="Nueva contraseña"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              hint={
                strengthInfo ? (
                  <div className="pw-strength">
                    <div className="pw-strength-bars">
                      {[0, 1, 2, 3].map((index) => (
                        <span
                          key={index}
                          className={`pw-strength-bar${index < STRENGTH_BARS[strength] ? ` ${strengthInfo.className}` : ""}`}
                        />
                      ))}
                    </div>
                    <span className={`pw-strength-label ${strengthInfo.className}`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                ) : (
                  <span className="pw-hint">Mínimo 8 caracteres. Combina letras, números y símbolos.</span>
                )
              }
            />

            <PasswordField
              id="cp-confirm"
              name="confirmPassword"
              label="Confirmar nueva contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              hint={
                confirmFilled && (
                  <span className={`pw-match ${confirmMatches ? "ok" : "bad"}`}>
                    {confirmMatches ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                  </span>
                )
              }
            />

            <div className="pw-footer">
              <button type="button" className="pw-btn pw-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="pw-btn pw-btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar contraseña"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
