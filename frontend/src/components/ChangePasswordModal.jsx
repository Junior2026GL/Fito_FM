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
    <div className="dlg-field">
      <label className="dlg-label" htmlFor={id}>{label}</label>
      <div className="dlg-input-wrap">
        <span className="dlg-input-icon"><IconLock /></span>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className="dlg-input"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
        />
        <button
          type="button"
          className="dlg-input-eye"
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
      className="dlg-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="dlg-modal">
        <header className="dlg-header">
          <span className="dlg-header-icon"><IconShield /></span>
          <div className="dlg-header-text">
            <h2 className="dlg-title" id="change-password-title">Cambiar contraseña</h2>
            <p className="dlg-subtitle">Protege tu cuenta con una contraseña segura</p>
          </div>
          <button type="button" className="dlg-close" onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>

        {success ? (
          <div className="dlg-body dlg-success">
            <span className="dlg-success-icon"><IconCheckCircle /></span>
            <h3 className="dlg-success-title">Contraseña actualizada</h3>
            <p className="dlg-success-text">
              Tu contraseña se cambió correctamente. Úsala la próxima vez que inicies sesión.
            </p>
            <button type="button" className="dlg-btn dlg-btn-primary" onClick={onClose}>
              Entendido
            </button>
          </div>
        ) : (
          <form className="dlg-body" onSubmit={handleSubmit}>
            {error && (
              <div className="dlg-alert" role="alert">
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
                  <div className="dlg-strength">
                    <div className="dlg-strength-bars">
                      {[0, 1, 2, 3].map((index) => (
                        <span
                          key={index}
                          className={`dlg-strength-bar${index < STRENGTH_BARS[strength] ? ` ${strengthInfo.className}` : ""}`}
                        />
                      ))}
                    </div>
                    <span className={`dlg-strength-label ${strengthInfo.className}`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                ) : (
                  <span className="dlg-hint">Mínimo 8 caracteres. Combina letras, números y símbolos.</span>
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
                  <span className={`dlg-match ${confirmMatches ? "ok" : "bad"}`}>
                    {confirmMatches ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                  </span>
                )
              }
            />

            <div className="dlg-footer">
              <button type="button" className="dlg-btn dlg-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="dlg-btn dlg-btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar contraseña"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
