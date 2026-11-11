import { useState } from "react";
import { buscarJrv } from "../services/jrv.service.js";
import { CASILLAS, EditarJrvModal } from "../components/EditarJrvModal.jsx";
import {
  IconAlert,
  IconCheckCircle,
  IconCity,
  IconEdit,
  IconGrid,
  IconInbox,
  IconMapPin,
  IconSearch
} from "../../../components/icons.jsx";
import { formatNumber } from "../../distrito-central/utils.js";

const Dato = ({ icon: Icon, label, value }) => (
  <div className="jrv-dato">
    <span className="jrv-dato-icon"><Icon /></span>
    <div>
      <span className="jrv-dato-label">{label}</span>
      <span className="jrv-dato-value">{value || "—"}</span>
    </div>
  </div>
);

const JrvCard = ({ jrv, onEditar }) => {
  const total = CASILLAS.reduce((suma, c) => suma + (Number(jrv[`c${c}`]) || 0), 0);

  return (
    <article className="jrv-card">
      <header className="jrv-card-head">
        <div className="jrv-card-title">
          <span className="jrv-urna-badge">JRV</span>
          <h2>Urna {jrv.urna}</h2>
          <span className="jrv-muni">{jrv.municipio}</span>
        </div>
        <div className="jrv-total">
          <span className="jrv-total-label">Total de votos</span>
          <strong>{formatNumber(total)}</strong>
        </div>
        <button type="button" className="dlg-btn dlg-btn-primary" onClick={() => onEditar(jrv)}>
          <IconEdit /> Editar votos
        </button>
      </header>

      <div className="jrv-datos">
        <Dato icon={IconCity} label="Ciudad" value={jrv.ciudad} />
        <Dato icon={IconMapPin} label="Sector electoral" value={jrv.sector_electoral} />
        <Dato icon={IconGrid} label="Centro de votación" value={jrv.centro} />
      </div>

      <div className="jrv-casillas" aria-label="Votos por casilla">
        {CASILLAS.map((c) => {
          const votos = jrv[`c${c}`];
          return (
            <div key={c} className={`jrv-casilla${Number(votos) > 0 ? " has-votos" : ""}`}>
              <span>{c}</span>
              <strong>{votos == null ? "—" : formatNumber(votos)}</strong>
            </div>
          );
        })}
      </div>
    </article>
  );
};

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
      <section className="jrv-hero">
        <div className="jrv-hero-text">
          <span className="jrv-hero-icon"><IconEdit /></span>
          <div>
            <h1 className="jrv-hero-title">Editar JRV</h1>
            <p className="jrv-hero-sub">Busca una JRV por su número de urna y corrige sus votos.</p>
          </div>
        </div>

        <form className="jrv-search" onSubmit={handleSubmit}>
          <label className="jrv-search-field">
            <IconSearch />
            <input
              type="search"
              inputMode="numeric"
              placeholder="Escribe el número de urna, ej. 10135"
              value={urna}
              onChange={(event) => setUrna(event.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </label>
          <button type="submit" className="jrv-search-btn" disabled={loading || !urna.trim()}>
            {loading ? <><span className="spinner" /> Buscando...</> : "Buscar"}
          </button>
        </form>
      </section>

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

      {resultados === null && !error && !loading && (
        <div className="jrv-placeholder">
          <span className="jrv-placeholder-icon"><IconSearch /></span>
          <p>Ingresa un número de urna para ver su información y editar sus votos.</p>
        </div>
      )}

      {resultados && resultados.length === 0 && (
        <div className="dt-card">
          <div className="dt-empty">
            <span className="dt-empty-icon"><IconInbox /></span>
            <p className="dt-empty-title">Sin resultados</p>
            <p className="dt-empty-text">No existe ninguna JRV con la urna {consultada}.</p>
          </div>
        </div>
      )}

      {resultados && resultados.length > 0 && (
        <div className="jrv-results">
          {resultados.length > 1 && (
            <p className="jrv-count">{resultados.length} JRV con la urna {consultada}</p>
          )}
          {resultados.map((jrv) => (
            <JrvCard
              key={`${jrv.municipio}|${jrv.sector_electoral}|${jrv.centro}`}
              jrv={jrv}
              onEditar={setEditando}
            />
          ))}
        </div>
      )}

      {editando && (
        <EditarJrvModal jrv={editando} onClose={() => setEditando(null)} onSaved={handleSaved} />
      )}
    </>
  );
};
