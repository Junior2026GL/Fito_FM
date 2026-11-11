import { useState } from "react";
import { buscarJrv } from "../services/jrv.service.js";
import { CASILLAS, EditarJrvModal } from "../components/EditarJrvModal.jsx";
import {
  IconAlert,
  IconCheckCircle,
  IconEdit,
  IconInbox,
  IconSearch
} from "../../../components/icons.jsx";
import { formatNumber } from "../../distrito-central/utils.js";

export const JrvPage = () => {
  const [urna, setUrna] = useState("");
  const [resultados, setResultados] = useState(null); // null = aún no se ha buscado
  const [consultada, setConsultada] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [editando, setEditando] = useState(null);

  const buscar = async (valor) => {
    setLoading(true);
    setError("");
    try {
      setResultados(await buscarJrv(valor));
      setConsultada(valor);
    } catch (err) {
      setResultados(null);
      setError(err.response?.data?.message || "No se pudo realizar la búsqueda.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const valor = urna.trim();
    if (!valor) return;
    setAviso("");
    buscar(valor);
  };

  const handleSaved = () => {
    setEditando(null);
    setAviso("JRV actualizada correctamente.");
    buscar(consultada);
  };

  return (
    <>
      <div className="dt-header">
        <div className="dt-header-main">
          <span className="dt-header-icon"><IconEdit /></span>
          <div>
            <h1 className="page-title">Editar JRV</h1>
            <p className="page-subtitle">Busca una JRV por su número de urna y corrige sus votos</p>
          </div>
        </div>
      </div>

      <form className="dt-toolbar" onSubmit={handleSubmit}>
        <label className="dt-search">
          <IconSearch />
          <input
            type="search"
            inputMode="numeric"
            placeholder="Número de urna (JRV)..."
            value={urna}
            onChange={(event) => setUrna(event.target.value.replace(/\D/g, ""))}
            autoFocus
          />
        </label>
        <button type="submit" className="dlg-btn dlg-btn-primary" disabled={loading || !urna.trim()}>
          {loading ? <><span className="spinner" /> Buscando...</> : "Buscar"}
        </button>
      </form>

      {aviso && (
        <div className="alert alert-success">
          <span className="alert-icon"><IconCheckCircle /></span>
          {aviso}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><IconAlert /></span>
          {error}
        </div>
      )}

      {resultados && (
        <div className="dt-card">
          <div className="dt-table-scroll">
            <table className="dt-table">
              <thead>
                <tr>
                  <th>Urna</th>
                  <th>Municipio</th>
                  <th>Ciudad</th>
                  <th>Sector electoral</th>
                  <th>Centro de votación</th>
                  <th>Total de votos</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {resultados.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="dt-empty">
                        <span className="dt-empty-icon"><IconInbox /></span>
                        <p className="dt-empty-title">Sin resultados</p>
                        <p className="dt-empty-text">No existe ninguna JRV con la urna {consultada}.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  resultados.map((jrv) => {
                    const total = CASILLAS.reduce((suma, c) => suma + (Number(jrv[`c${c}`]) || 0), 0);
                    return (
                      <tr key={`${jrv.municipio}|${jrv.sector_electoral}|${jrv.centro}`}>
                        <td className="dc-name">Urna {jrv.urna}</td>
                        <td>{jrv.municipio}</td>
                        <td>{jrv.ciudad}</td>
                        <td>{jrv.sector_electoral}</td>
                        <td>{jrv.centro}</td>
                        <td>{formatNumber(total)}</td>
                        <td>
                          <button type="button" className="dlg-btn dlg-btn-secondary" onClick={() => setEditando(jrv)}>
                            <IconEdit /> Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editando && (
        <EditarJrvModal jrv={editando} onClose={() => setEditando(null)} onSaved={handleSaved} />
      )}
    </>
  );
};
