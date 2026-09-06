import { useState, useEffect, useCallback } from "react";
import { getDashboardSummary } from "../services/dashboard.service.js";

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ background: color + "18", color }}>
      {icon}
    </div>
    <div className="stat-card-body">
      <div className="stat-value" style={{ color }}>{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconSlash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
);
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
);
const IconUsersGroup = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="6" r="3"/></svg>
);

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getDashboardSummary();
      setSummary(result.data);
    } catch {
      setError("No se pudo cargar el resumen del dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general del sistema</p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error">
          <span className="alert-icon">!</span>
          {error}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={fetchSummary}>
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="stats-row">
          {[0, 1, 2, 3].map((i) => (
            <div className="stat-card" key={i}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
              <div className="stat-card-body">
                <div className="skeleton" style={{ width: 60, height: 20, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 100, height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="stats-row">
            <StatCard label="Usuarios registrados" value={summary.usuarios.total} color="#0f172a" icon={<IconUsers />} />
            <StatCard label="Usuarios activos" value={summary.usuarios.active} color="#15803d" icon={<IconCheck />} />
            <StatCard label="Usuarios inactivos" value={summary.usuarios.inactive} color="#64748b" icon={<IconSlash />} />
            <StatCard label="Administradores" value={summary.usuarios.admins} color="#1d4ed8" icon={<IconShield />} />
          </div>

          <div className="stats-row">
            <StatCard label="Municipios" value={summary.electoral.total_municipios} color="#0f172a" icon={<IconHome />} />
            <StatCard label="Centros de votación" value={summary.electoral.total_centros} color="#1d4ed8" icon={<IconMap />} />
            <StatCard label="Carga electoral" value={summary.electoral.carga_electoral?.toLocaleString("es-HN")} color="#7c3aed" icon={<IconUsersGroup />} />
            <StatCard label="Total JRV" value={summary.electoral.total_jrv} color="#15803d" icon={<IconCheck />} />
          </div>
        </>
      )}
    </>
  );
};
