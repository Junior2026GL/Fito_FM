import { useState } from "react";
import { FranciscoMorazanMap } from "../components/FranciscoMorazanMap.jsx";

export const DiputadosPage = () => {
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState(null);

  return (
    <div className="diputados-layout">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Resultados por Municipio</h1>
          <p className="page-subtitle">
            Francisco Morazán · Seleccioná un municipio para ver el detalle
          </p>
        </div>
      </div>

      {/* Cuerpo: mapa + panel */}
      <div className="diputados-body">
        {/* Mapa */}
        <div className="card diputados-map-card">
          <FranciscoMorazanMap onMunicipioClick={setMunicipioSeleccionado} />
        </div>

        {/* Panel lateral */}
        <div className="card diputados-info-card">
          {municipioSeleccionado ? (
            <>
              <p className="eyebrow">Municipio seleccionado</p>
              <h2 className="diputados-muni-title">{municipioSeleccionado.label}</h2>
              <div className="diputados-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M9 17v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
                  <circle cx="13" cy="7" r="4" />
                  <path d="M1 17v-2a4 4 0 0 1 4-4h2" />
                  <circle cx="5" cy="7" r="3" />
                </svg>
                <p>Los resultados de aspirantes se integrarán aquí</p>
              </div>
            </>
          ) : (
            <div className="diputados-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <p>Seleccioná un municipio en el mapa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
