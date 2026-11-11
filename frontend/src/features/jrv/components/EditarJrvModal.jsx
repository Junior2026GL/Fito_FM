import { useMemo, useState } from "react";
import { Dialog, DialogError, DialogSection } from "../../../components/Dialog.jsx";
import { IconEdit } from "../../../components/icons.jsx";
import { actualizarJrv } from "../services/jrv.service.js";

export const CASILLAS = Array.from({ length: 23 }, (_, i) => 93 + i);

const aTexto = (valor) => (valor == null ? "" : String(valor));

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
      title={`Editar urna ${jrv.urna}`}
      subtitle={`${jrv.centro} · ${jrv.sector_electoral}`}
      size="lg"
      onClose={onClose}
    >
      <form className="dlg-form" onSubmit={handleSubmit}>
        <div className="dlg-body">
          <DialogError message={error} />

          <DialogSection>Votos por casilla</DialogSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
            {CASILLAS.map((casilla) => (
              <div className="dlg-field" key={casilla}>
                <label className="dlg-label" htmlFor={`casilla-${casilla}`}>Casilla {casilla}</label>
                <input
                  id={`casilla-${casilla}`}
                  className="dlg-input"
                  inputMode="numeric"
                  maxLength={7}
                  value={valores[casilla]}
                  onChange={(event) => handleChange(casilla, event.target.value)}
                />
              </div>
            ))}
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
