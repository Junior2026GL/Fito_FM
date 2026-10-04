import { useEffect } from "react";
import { IconAlert, IconClose } from "./icons.jsx";

/**
 * Estructura común de las ventanas: encabezado azul con icono, cuerpo con scroll
 * y pie fijo. Se cierra con Escape o haciendo clic fuera.
 * Los hijos deben ser `.dlg-body` y `.dlg-footer` (dentro de un `<form className="dlg-form">` si aplica).
 */
export const Dialog = ({ icon: Icon, title, subtitle, size, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="dlg-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`dlg-modal${size ? ` dlg-modal-${size}` : ""}`}>
        <header className="dlg-header">
          <span className="dlg-header-icon"><Icon /></span>
          <div className="dlg-header-text">
            <h2 className="dlg-title">{title}</h2>
            {subtitle && <p className="dlg-subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="dlg-close" onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
};

export const DialogError = ({ message }) =>
  message ? (
    <div className="dlg-alert" role="alert">
      <IconAlert />
      <span>{message}</span>
    </div>
  ) : null;

export const DialogSection = ({ children }) => (
  <h3 className="dlg-section">{children}</h3>
);
