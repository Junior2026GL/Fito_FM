import { useEffect, useState } from "react";
import { getMunicipio } from "../services/diputados.service.js";
import papeleta from "../../../assets/papeleta.png";

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
  const [cargando, setCargando] = useState(true);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Cargar datos del municipio
  useEffect(() => {
    if (!municipio) return;
    setCargando(true);
    setDatos(null);
    getMunicipio(municipio.label)
      .then(setDatos)
      .catch(() => setDatos(null))
      .finally(() => setCargando(false));
  }, [municipio]);

  if (!municipio) return null;

  const formatNum = (n) =>
    n != null ? Number(n).toLocaleString("es-HN") : "—";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div className="modal-header">
          <div className="modal-header-content">
            <span className="modal-eyebrow">Francisco Morazán</span>
            <h2 className="modal-title">{municipio.label}</h2>
          </div>
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

          <div className="modal-stat-card modal-stat-placeholder">
            <span className="modal-stat-label">Próximamente</span>
            <span className="modal-stat-value-sm">más información</span>
          </div>
        </div>

        {/* ── PAPELETA ── */}
        <div className="modal-papeleta-banner">
          <img src={papeleta} alt="Papeleta electoral" className="modal-papeleta-img" />
        </div>

        {/* ── BODY – espacio para tablas / gráficos futuros ── */}
        <div className="modal-body">
          <div className="modal-body-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p>Aquí se mostrarán los resultados por aspirante y detalle de JRVs</p>
          </div>
        </div>

      </div>
    </div>
  );
};
