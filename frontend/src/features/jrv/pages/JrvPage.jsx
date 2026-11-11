import { useEffect, useMemo, useRef, useState } from "react";
import { actualizarJrv, buscarJrv } from "../services/jrv.service.js";
import {
  IconAlert,
  IconCheck,
  IconCity,
  IconEdit,
  IconGrid,
  IconInbox,
  IconList,
  IconMapPin,
  IconSearch
} from "../../../components/icons.jsx";
import { formatNumber } from "../../distrito-central/utils.js";

// Casilla 93 … Casilla 115 (posiciones 1 a 23)
const CASILLAS = Array.from({ length: 23 }, (_, i) => 93 + i);

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

const JrvCard = ({ jrv, onSaved }) => {
  const inicial = useMemo(
    () => Object.fromEntries(CASILLAS.map((c) => [c, aTexto(jrv[`c${c}`])])),
    [jrv]
  );
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const total = CASILLAS.reduce(
    (suma, c) => suma + (Number(editando ? valores[c] : jrv[`c${c}`]) || 0),
    0
  );

  const empezar = () => {
    setValores(inicial);
    setError("");
    setEditando(true);
  };

  const cancelar = () => {
    setEditando(false);
    setError("");
  };

  const handleChange = (casilla, texto) => {
    // Solo números enteros
    setValores((prev) => ({ ...prev, [casilla]: texto.replace(/\D/g, "") }));
  };

  const guardar = async () => {
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
      setEditando(false);
      return;
    }

    setGuardando(true);
    try {
      await actualizarJrv(jrv, votos);
      setEditando(false);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudieron guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <article className={`jrv-card${editando ? " is-editing" : ""}`}>
      <header className="jrv-card-head">
        <div className="jrv-card-title">
          <span className="jrv-urna-badge">{editando ? "EDITANDO" : "JRV"}</span>
          <h2>Urna {jrv.urna}</h2>
          <span className="jrv-muni">{jrv.municipio}</span>
        </div>
        <div className="jrv-total">
          <span className="jrv-total-label">Total de votos</span>
          <strong>{formatNumber(total)}</strong>
        </div>
        {!editando && (
          <button type="button" className="dlg-btn dlg-btn-primary" onClick={empezar}>
            <IconEdit /> Editar votos
          </button>
        )}
      </header>

      <div className="jrv-datos">
        <Dato icon={IconCity} label="Ciudad" value={jrv.ciudad} />
        <Dato icon={IconMapPin} label="Sector electoral" value={jrv.sector_electoral} />
        <Dato icon={IconGrid} label="Centro de votación" value={jrv.centro} />
        <Dato icon={IconList} label="Categoría" value={jrv.categoria} />
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><IconAlert /></span>
          {error}
        </div>
      )}

      {editando && (
        <p className="jrv-edit-hint">
          Arriba va el número de casilla; escribe los votos en el recuadro blanco de abajo.
        </p>
      )}

      <div className="jrv-casillas" aria-label="Votos por casilla">
        {CASILLAS.map((c) => {
          const votos = jrv[`c${c}`];
          if (!editando) {
            return (
              <div key={c} className={`jrv-casilla${Number(votos) > 0 ? " has-votos" : ""}`}>
                <span>{c}</span>
                <strong>{votos == null ? "—" : formatNumber(votos)}</strong>
              </div>
            );
          }
          const cambiado = valores[c] !== inicial[c];
          return (
            <label key={c} className={`jrv-casilla jrv-casilla-edit${cambiado ? " changed" : ""}`}>
              <span>{c}</span>
              <input
                inputMode="numeric"
                maxLength={7}
                value={valores[c]}
                onChange={(event) => handleChange(c, event.target.value)}
                aria-label={`Votos de la casilla ${c}`}
              />
            </label>
          );
        })}
      </div>

      {editando && (
        <footer className="jrv-card-actions">
          <button type="button" className="dlg-btn dlg-btn-secondary" onClick={cancelar} disabled={guardando}>
            Cancelar
          </button>
          <button type="button" className="dlg-btn dlg-btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? <><span className="spinner" /> Guardando...</> : "Guardar cambios"}
          </button>
        </footer>
      )}
    </article>
  );
};

export const JrvPage = () => {
  const [urna, setUrna] = useState("");
  const [resultados, setResultados] = useState(null); // null = aún no se ha buscado
  const [consultada, setConsultada] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // Aviso flotante abajo a la derecha, igual que en Usuarios
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

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
    setToast("");
    buscar(valor);
  };

  const handleSaved = () => {
    showToast("JRV actualizada correctamente");
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
              placeholder="N.º de urna"
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

      {toast && (
        <div className="toast toast-success" role="status">
          <span className="toast-icon"><IconCheck /></span>
          {toast}
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
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}
    </>
  );
};
