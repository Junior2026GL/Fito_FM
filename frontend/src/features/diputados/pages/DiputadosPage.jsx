import { useState } from "react";
import { FranciscoMorazanMap } from "../components/FranciscoMorazanMap.jsx";
import { MunicipioModal } from "../components/MunicipioModal.jsx";

export const DiputadosPage = () => {
  const [modalMunicipio, setModalMunicipio] = useState(null);

  return (
    <div className="diputados-layout">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Resultados por Municipio</h1>
          <p className="page-subtitle">
            Francisco Morazán · Clic en un municipio para ver el detalle
          </p>
        </div>
      </div>

      {/* Mapa a pantalla completa */}
      <div className="card diputados-map-card">
        <FranciscoMorazanMap onMunicipioClick={setModalMunicipio} />
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
