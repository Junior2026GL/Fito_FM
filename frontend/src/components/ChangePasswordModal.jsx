import { useState } from "react";
import { changePassword } from "../features/auth/services/auth.service.js";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const inputType = showPasswords ? "text" : "password";

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="change-password-title">Cambiar contraseña</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span> {error}
          </div>
        )}

        {success ? (
          <>
            <div className="alert alert-success">
              Tu contraseña se actualizó correctamente.
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="cp-current">Contraseña actual</label>
              <input id="cp-current" name="currentPassword" type={inputType} className="form-input"
                value={form.currentPassword} onChange={handleChange}
                autoComplete="current-password" required autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cp-new">Nueva contraseña</label>
              <input id="cp-new" name="newPassword" type={inputType} className="form-input"
                value={form.newPassword} onChange={handleChange}
                autoComplete="new-password" minLength={8} required />
              <span className="form-hint">Mínimo 8 caracteres</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cp-confirm">Confirmar nueva contraseña</label>
              <input id="cp-confirm" name="confirmPassword" type={inputType} className="form-input"
                value={form.confirmPassword} onChange={handleChange}
                autoComplete="new-password" minLength={8} required />
            </div>

            <label className="checkbox-inline">
              <input type="checkbox" checked={showPasswords}
                onChange={(event) => setShowPasswords(event.target.checked)} />
              Mostrar contraseñas
            </label>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar contraseña"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
