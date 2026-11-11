import { useMemo, useState } from "react";
import { Dialog, DialogError } from "../../../components/Dialog.jsx";
import { IconCity, IconEdit, IconGrid, IconMapPin } from "../../../components/icons.jsx";
import papeleta from "../../../assets/papeleta.png";
import { actualizarJrv } from "../services/jrv.service.js";

export const CASILLAS = Array.from({ length: 23 }, (_, i) => 93 + i);

const aTexto = (valor) => (valor == null ? "" : String(valor));

const Dato = ({ icon: Icon, label, value }) => (
  <div className="jrv-dato">
    <span className="jrv-dato-icon"><Icon /></span>
    <div>
      <span className="jrv-dato-label">{label}</span>
      <span className="jrv-dato-value">{value || "—"}</span>
    </div>
  </div>
);

/** Ventana para corregir los votos (Casilla 93–115) de una JRV. */
export const EditarJrvModal = ({ jrv, onClose, onSaved }) => {
  const inicial = useMemo(
    () => Object.fromEntries(CASILLAS.map((c) => [c, aTexto(jrv[`c${c}`])])),
    [jrv]
  );
  const [valores, setValores] = useState(inicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (casilla, texto) => {
    // Solo números enteros
    setValores((prev) => ({ ...prev, [casilla]: texto.replace(/\D/g, "") }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Solo se envían las casillas que cambiaron; una casilla vacía no se puede guardar
    const votos = {};
    for (const casilla of CASILLAS) {
      if (valores[casilla] === inicial[casilla]) continue;
      if (valores[casilla] === "") {
        setError(`La casilla ${casilla} no puede quedar vacía.`);
        return;
      }
      votos[casilla] = Number(valores[casilla]);
    }

    if (Object.keys(votos).length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await actualizarJrv(jrv, votos);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      icon={IconEdit}
      title="Editar"
      subtitle={`Urna ${jrv.urna}`}
      size="xxl"
      onClose={onClose}
    >
      <form className="dlg-form" onSubmit={handleSubmit}>
        <div className="dlg-body">
          <DialogError message={error} />

          {/* Información de la JRV */}
          <div className="jrv-edit-info">
            <div className="jrv-edit-info-main">
              <span className="jrv-urna-badge">EDITAR</span>
              <h2>Urna {jrv.urna}</h2>
              <span className="jrv-muni">{jrv.municipio}</span>
            </div>
            <div className="jrv-datos jrv-datos-compact">
              <Dato icon={IconCity} label="Ciudad" value={jrv.ciudad} />
              <Dato icon={IconMapPin} label="Sector electoral" value={jrv.sector_electoral} />
              <Dato icon={IconGrid} label="Centro de votación" value={jrv.centro} />
            </div>
          </div>

          {/* Posiciones 1–23 y una casilla editable por posición */}
          <div className="dc-votos-scroll">
            <div className="dc-votos-inner" style={{ "--dc-col-min": "58px" }}>
              <div className="modal-papeleta-banner">
                <img src={papeleta} alt="Papeleta electoral" className="modal-papeleta-img" />
              </div>

              <div className="casillas-pos-row">
                {CASILLAS.map((_, index) => (
                  <div key={index} className="casilla-pos-box">{index + 1}</div>
                ))}
              </div>

              <div className="casillas-grid">
                {CASILLAS.map((casilla) => {
                  const cambiado = valores[casilla] !== inicial[casilla];
                  return (
                    <label key={casilla} className={`casilla-card casilla-edit${cambiado ? " changed" : ""}`}>
                      <span className="casilla-numero">{casilla}</span>
                      <input
                        className="casilla-input"
                        inputMode="numeric"
                        maxLength={7}
                        value={valores[casilla]}
                        onChange={(event) => handleChange(casilla, event.target.value)}
                        aria-label={`Votos de la casilla ${casilla}`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="dlg-footer">
          <button type="button" className="dlg-btn dlg-btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="dlg-btn dlg-btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Guardando...</> : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
