import { useMemo, useState } from "react";
import { Dialog } from "../../../components/Dialog.jsx";
import { IconList, IconSearch } from "../../../components/icons.jsx";
import { formatNumber } from "../utils.js";

/** Ventana con las urnas (JRV) de un centro de votación y la casilla con más marcas en cada una. */
export const UrnasModal = ({ centro, urnas, onClose }) => {
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const texto = busqueda.trim();
    return texto ? urnas.filter((u) => String(u.urna).includes(texto)) : urnas;
  }, [urnas, busqueda]);

  return (
    <Dialog
      icon={IconList}
      title="Urnas del centro"
      subtitle={centro}
      size="lg"
      onClose={onClose}
    >
      <div className="dlg-body">
        <div className="dc-urnas-toolbar">
          <label className="dt-search">
            <IconSearch />
            <input
              type="search"
              placeholder="Buscar por número de urna..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              autoFocus
            />
          </label>
          <span className="page-chip">
            {visibles.length === urnas.length
              ? `${urnas.length} ${urnas.length === 1 ? "urna" : "urnas"}`
              : `${visibles.length} de ${urnas.length}`}
          </span>
        </div>

        <div className="dc-urnas-scroll">
          <table className="dt-table dc-urnas-table">
            <thead>
              <tr>
                <th>Urna</th>
                <th>Casilla líder</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={2} className="dc-empty-cell">No hay urnas con ese número.</td>
                </tr>
              ) : (
                visibles.map((urna) => (
                  <tr key={urna.urna}>
                    <td className="dc-name">Urna {urna.urna}</td>
                    <td>
                      {urna.lider ? (
                        <span className="dt-badge tone-blue">
                          Casilla {urna.lider.casilla} · {formatNumber(urna.lider.votos)}
                        </span>
                      ) : (
                        <span className="dt-none">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dlg-footer">
        <button type="button" className="dlg-btn dlg-btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Dialog>
  );
};
