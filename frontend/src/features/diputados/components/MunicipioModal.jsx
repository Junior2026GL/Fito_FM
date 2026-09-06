import { useEffect, useState } from "react";
import { getCiudadesByMunicipio, getMunicipio, getVotosByMunicipio } from "../services/diputados.service.js";
import papeleta from "../../../assets/papeleta.png";

const formatCiudad = (c) =>
  c ? c.charAt(0) + c.slice(1).toLowerCase() : c;

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconElectoral = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const MunicipioModal = ({ municipio, onClose }) => {
  const [datos, setDatos] = useState(null);
  const [votos, setVotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const cargarDatos = (municipioLabel, ciudad) => {
    setCargando(true);
    setDatos(null);
    setVotos([]);
    Promise.all([
      getMunicipio(municipioLabel, ciudad),
      getVotosByMunicipio(municipioLabel, ciudad),
    ])
      .then(([d, v]) => { setDatos(d); setVotos(v); })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!municipio) return;
    setCiudades([]);
    setCiudadSeleccionada(null);
    cargarDatos(municipio.label, null);
    getCiudadesByMunicipio(municipio.label)
      .then((list) => setCiudades(list.length > 1 ? list : []))
      .catch(() => {});
  }, [municipio]);

  const handleCiudadClick = (ciudad) => {
    if (ciudad === ciudadSeleccionada) return;
    setCiudadSeleccionada(ciudad);
    cargarDatos(municipio.label, ciudad);
  };

  if (!municipio) return null;

  const formatNum = (n) =>
    n != null ? Number(n).toLocaleString("es-HN") : "—";

  const maxVotos = votos[0]?.votos || 1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div className="modal-header">
          <div className="modal-header-content">
            <span className="modal-eyebrow">Francisco Morazán</span>
            <h2 className="modal-title">{municipio.label}</h2>
          </div>

          {ciudades.length > 0 && (
            <div className="modal-ciudad-tabs">
              <button
                type="button"
                className={`modal-ciudad-tab${ciudadSeleccionada === null ? " active" : ""}`}
                onClick={() => handleCiudadClick(null)}
              >
                Todos
              </button>
              {ciudades.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`modal-ciudad-tab${ciudadSeleccionada === c ? " active" : ""}`}
                  onClick={() => handleCiudadClick(c)}
                >
                  {formatCiudad(c)}
                </button>
              ))}
            </div>
          )}

          <button className="modal-close" onClick={onClose} title="Cerrar">
            <IconClose />
          </button>
        </div>

        {/* ── STATS ROW ── */}
        <div className="modal-stats-row">
          <div className="modal-stat-card">
            <div className="modal-stat-icon">
              <IconElectoral />
            </div>
            <div className="modal-stat-body">
              <span className="modal-stat-label">Carga Electoral</span>
              <span className="modal-stat-value">
                {cargando ? <span className="modal-stat-loading" /> : formatNum(datos?.carga_electoral)}
              </span>
              <span className="modal-stat-sub">Total de electores habilitados</span>
            </div>
          </div>

          <div className="modal-stat-card">
            <div className="modal-stat-icon" style={{ background: "#f0fdf4", color: "#166534" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div className="modal-stat-body">
              <span className="modal-stat-label">Total JRV</span>
              <span className="modal-stat-value">
                {cargando ? <span className="modal-stat-loading" /> : formatNum(datos?.total_jrv)}
              </span>
              <span className="modal-stat-sub">Juntas receptoras de votos</span>
            </div>
          </div>

          <div className="modal-stat-card">
            <div className="modal-stat-icon" style={{ background: "#fff7ed", color: "#c2410c" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="modal-stat-body">
              <span className="modal-stat-label">Centros de Votación</span>
              <span className="modal-stat-value" style={{ color: "#c2410c" }}>
                {cargando ? <span className="modal-stat-loading" /> : formatNum(datos?.total_centros)}
              </span>
              <span className="modal-stat-sub">Centros habilitados en el municipio</span>
            </div>
          </div>
        </div>

        {/* ── PAPELETA ── */}
        <div className="modal-papeleta-banner">
          <img src={papeleta} alt="Papeleta electoral" className="modal-papeleta-img" />
        </div>

        {/* ── VOTOS POR CASILLA ── */}
        <div className="modal-body">
          {cargando ? (
            <div className="casillas-skeleton">
              {Array.from({ length: 23 }).map((_, i) => (
                <div key={i} className="casilla-card-skeleton" />
              ))}
            </div>
          ) : votos.length > 0 ? (
            <>
              {/* Fila de posiciones */}
              <div className="casillas-pos-row">
                {votos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`casilla-pos-box${
                      idx === 0 ? " casilla-pos-gold" : idx === 1 ? " casilla-pos-silver" : idx === 2 ? " casilla-pos-bronze" : ""
                    }`}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>

              <div className="casillas-grid">
                {votos.map((item) => (
                  <div key={item.casilla} className="casilla-card">
                    <span className="casilla-numero">{item.casilla}</span>
                    <span className="casilla-votos">{formatNum(item.votos)}</span>
                    <div className="casilla-bar-track">
                      <div
                        className="casilla-bar-fill"
                        style={{ width: `${Math.round((item.votos / maxVotos) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="modal-body-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <p>No se encontraron datos de votos para este municipio</p>
            </div>
          )}

          {!cargando && datos && null}
        </div>

      </div>
    </div>
  );
};
