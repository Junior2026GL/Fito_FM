const fmt = (n) => n != null ? Number(n).toLocaleString("es-HN") : "—";

export const ParticipacionChart = ({ cargaElectoral, totalVotos }) => {
  const ce = Number(cargaElectoral) || 0;
  const tv = Number(totalVotos) || 0;
  const pct = ce > 0 ? Math.min((tv / ce) * 100, 100) : 0;
  const pctStr = pct.toFixed(1) + "%";
  const abstenciones = Math.max(ce - tv, 0);

  return (
    <div className="participacion-chart">
      <p className="eyebrow" style={{ marginBottom: 16 }}>
        Participación Electoral
      </p>

      {/* Barras comparativas */}
      <div className="chart-bars">
        {/* Carga Electoral */}
        <div className="chart-row">
          <span className="chart-label">Carga Electoral</span>
          <div className="chart-track">
            <div className="chart-fill chart-fill-ce" style={{ width: "100%" }} />
          </div>
          <span className="chart-value">{fmt(ce)}</span>
        </div>

        {/* Total Marcas */}
        <div className="chart-row">
          <span className="chart-label">Total Marcas</span>
          <div className="chart-track">
            <div
              className="chart-fill chart-fill-tv"
              style={{ width: ce > 0 ? `${(tv / ce) * 100}%` : "0%" }}
            />
          </div>
          <span className="chart-value chart-value-blue">{fmt(tv)}</span>
        </div>

        {/* Abstenciones */}
        <div className="chart-row">
          <span className="chart-label">Abstenciones</span>
          <div className="chart-track">
            <div
              className="chart-fill chart-fill-abs"
              style={{ width: ce > 0 ? `${(abstenciones / ce) * 100}%` : "0%" }}
            />
          </div>
          <span className="chart-value chart-value-gray">{fmt(abstenciones)}</span>
        </div>
      </div>

      {/* Badge de participación */}
      <div className="chart-pct-badge">
        <div
          className="chart-ring"
          style={{ "--pct": pct }}
        >
          <span className="chart-ring-value">{pctStr}</span>
        </div>
        <div>
          <p className="chart-pct-title">Participación</p>
          <p className="chart-pct-sub">{fmt(tv)} de {fmt(ce)} electores votaron</p>
        </div>
      </div>
    </div>
  );
};
