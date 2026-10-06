import { useCallback, useEffect, useRef, useState } from "react";
import { IconAlert, IconClose } from "./icons.jsx";

/**
 * Estructura común de las ventanas: encabezado azul con icono, cuerpo con scroll
 * y pie fijo. No se cierra al hacer clic fuera (el fondo solo "sacude" la ventana);
 * se cierra con Escape, la X o los botones. Si hay datos escritos, la X y Escape
 * piden confirmar antes de descartarlos.
 * Los hijos deben ser `.dlg-body` y `.dlg-footer` (dentro de un `<form className="dlg-form">` si aplica).
 */
export const Dialog = ({ icon: Icon, title, subtitle, size, onClose, children }) => {
  const modalRef = useRef(null);
  const hayCambios = useRef(false);
  const [confirmando, setConfirmando] = useState(false);
  const [sacudiendo, setSacudiendo] = useState(false);

  const pedirCierre = useCallback(() => {
    if (hayCambios.current) setConfirmando(true);
    else onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (confirmando) setConfirmando(false);
      else pedirCierre();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pedirCierre, confirmando]);

  // El foco queda dentro de la ventana al abrirla
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const sacudir = (event) => {
    if (event.target !== event.currentTarget) return;
    setSacudiendo(false);
    requestAnimationFrame(() => setSacudiendo(true));
  };

  return (
    <div
      className="dlg-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={sacudir}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`dlg-modal${size ? ` dlg-modal-${size}` : ""}${sacudiendo ? " dlg-shake" : ""}`}
        onAnimationEnd={(event) => event.animationName === "dlgShake" && setSacudiendo(false)}
        onInput={() => { hayCambios.current = true; }}
      >
        <header className="dlg-header">
          <span className="dlg-header-icon"><Icon /></span>
          <div className="dlg-header-text">
            <h2 className="dlg-title">{title}</h2>
            {subtitle && <p className="dlg-subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="dlg-close" onClick={pedirCierre} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>
        {children}

        {confirmando && (
          <div className="dlg-confirm" role="alertdialog" aria-label="Descartar cambios">
            <div className="dlg-confirm-box">
              <h3 className="dlg-confirm-title">¿Descartar los cambios?</h3>
              <p className="dlg-confirm-text">Lo que escribiste no se guardará.</p>
              <div className="dlg-confirm-actions">
                <button type="button" className="dlg-btn dlg-btn-secondary" onClick={() => setConfirmando(false)} autoFocus>
                  Seguir editando
                </button>
                <button type="button" className="dlg-btn dlg-btn-danger" onClick={onClose}>
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}
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
