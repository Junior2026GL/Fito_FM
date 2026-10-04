import { useState } from "react";
import { changePassword } from "../features/auth/services/auth.service.js";
import { Dialog, DialogError } from "./Dialog.jsx";
import { PasswordField, PasswordMatch, PasswordStrength } from "./DialogFields.jsx";
import { IconCheckCircle, IconShield } from "./icons.jsx";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState(EMPTY);
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

  return (
    <Dialog
      icon={IconShield}
      title="Cambiar contraseña"
      subtitle="Protege tu cuenta con una contraseña segura"
      onClose={onClose}
    >
      {success ? (
        <>
          <div className="dlg-body dlg-success">
            <span className="dlg-success-icon"><IconCheckCircle /></span>
            <h3 className="dlg-success-title">Contraseña actualizada</h3>
            <p className="dlg-success-text">
              Tu contraseña se cambió correctamente. Úsala la próxima vez que inicies sesión.
            </p>
          </div>
          <div className="dlg-footer">
            <button type="button" className="dlg-btn dlg-btn-primary" onClick={onClose}>
              Entendido
            </button>
          </div>
        </>
      ) : (
        <form className="dlg-form" onSubmit={handleSubmit}>
          <div className="dlg-body">
            <DialogError message={error} />

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
              hint={<PasswordStrength password={form.newPassword} />}
            />

            <PasswordField
              id="cp-confirm"
              name="confirmPassword"
              label="Confirmar nueva contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              hint={<PasswordMatch password={form.newPassword} confirmation={form.confirmPassword} />}
            />
          </div>

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
    </Dialog>
  );
};
