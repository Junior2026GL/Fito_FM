import { useState } from "react";
import { IconEye, IconEyeOff, IconLock } from "./icons.jsx";

export const TextField = ({ id, label, icon: Icon, hint, ...inputProps }) => (
  <div className="dlg-field">
    <label className="dlg-label" htmlFor={id}>{label}</label>
    <div className="dlg-input-wrap">
      <span className="dlg-input-icon"><Icon /></span>
      <input id={id} className="dlg-input" {...inputProps} />
    </div>
    {hint}
  </div>
);

/** Campo de contraseña con candado y botón para mostrar/ocultar. */
export const PasswordField = ({
  id,
  name,
  label,
  value,
  onChange,
  hint,
  autoComplete = "new-password",
  autoFocus = false,
  minLength,
  forceVisible = false
}) => {
  const [show, setShow] = useState(false);
  const visible = show || forceVisible;

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
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="dlg-input-eye"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {hint}
    </div>
  );
};

const STRENGTH_LEVELS = [
  { label: "Muy débil", className: "weak" },
  { label: "Débil", className: "weak" },
  { label: "Media", className: "medium" },
  { label: "Fuerte", className: "strong" },
  { label: "Muy fuerte", className: "strong" }
];

const STRENGTH_BARS = [1, 1, 2, 3, 4];

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
};

/** Medidor de fortaleza; sin texto escrito muestra una pista. */
export const PasswordStrength = ({ password }) => {
  if (!password) {
    return <span className="dlg-hint">Mínimo 8 caracteres. Combina letras, números y símbolos.</span>;
  }

  const strength = getStrength(password);
  const info = STRENGTH_LEVELS[strength];

  return (
    <div className="dlg-strength">
      <div className="dlg-strength-bars">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`dlg-strength-bar${index < STRENGTH_BARS[strength] ? ` ${info.className}` : ""}`}
          />
        ))}
      </div>
      <span className={`dlg-strength-label ${info.className}`}>{info.label}</span>
    </div>
  );
};

export const PasswordMatch = ({ password, confirmation }) => {
  if (!confirmation) return null;
  const matches = password === confirmation;

  return (
    <span className={`dlg-match ${matches ? "ok" : "bad"}`}>
      {matches ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
    </span>
  );
};
