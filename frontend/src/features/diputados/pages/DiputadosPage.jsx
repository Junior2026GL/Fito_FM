import { useCallback, useMemo, useState } from "react";
import { FranciscoMorazanMap } from "../components/FranciscoMorazanMap.jsx";
import { MunicipioModal } from "../components/MunicipioModal.jsx";
import { MUNICIPIOS } from "../data/municipios.js";

const normalize = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const DiputadosPage = () => {
  const [modalMunicipio, setModalMunicipio] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const [search, setSearch] = useState("");

  const openMunicipio = useCallback((municipio) => {
    setSelectedKey(municipio.key);
    setModalMunicipio(municipio);
  }, []);

  const filtered = useMemo(() => {
    const query = normalize(search.trim());
    return MUNICIPIOS.filter((m) => normalize(m.label).includes(query));
  }, [search]);

  return (
    <div className="diputados-layout">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Elecciones Generales 2025</p>
          <h1 className="page-title">Resultados por Municipio</h1>
          <p className="page-subtitle">
            Selecciona un municipio en el mapa o en la lista para ver el detalle
          </p>
        </div>
        <span className="page-chip">
          Francisco Morazán · {MUNICIPIOS.length} municipios
        </span>
      </div>

      <div className="diputados-grid">
        {/* Mapa */}
        <div className="card diputados-map-card">
          <FranciscoMorazanMap
            selectedKey={selectedKey}
            hoverKey={hoverKey}
            onMunicipioClick={openMunicipio}
            onMunicipioHover={setHoverKey}
          />
        </div>

        {/* Panel de municipios */}
        <aside className="card muni-panel">
          <div className="muni-panel-header">
            <h2 className="muni-panel-title">Municipios</h2>
            <span className="muni-panel-count">{filtered.length}</span>
          </div>

          <input
            type="search"
            className="muni-search"
            placeholder="Buscar municipio..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar municipio"
          />

          <ul className="muni-list">
            {filtered.map((municipio) => (
              <li key={municipio.key}>
                <button
                  type="button"
                  className={`muni-item${selectedKey === municipio.key ? " active" : ""}${hoverKey === municipio.key ? " hover" : ""}`}
                  onClick={() => openMunicipio(municipio)}
                  onMouseEnter={() => setHoverKey(municipio.key)}
                  onMouseLeave={() => setHoverKey(null)}
                >
                  <span>{municipio.label}</span>
                  <span className="muni-item-arrow" aria-hidden="true">›</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="muni-empty">Sin resultados para "{search}"</li>
            )}
          </ul>
        </aside>
      </div>

      {/* Modal */}
      {modalMunicipio && (
        <MunicipioModal
          municipio={modalMunicipio}
          onClose={() => setModalMunicipio(null)}
        />
      )}
    </div>
  );
};
