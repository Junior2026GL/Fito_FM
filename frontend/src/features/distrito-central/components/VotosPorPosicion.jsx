import papeleta from "../../../assets/papeleta.png";
import { formatNumber } from "../utils.js";

/** Marcas recibidas por cada posición de la papeleta, de mayor a menor. */
export const VotosPorPosicion = ({ votos, cargando }) => {
  const maximo = votos[0]?.votos || 1;

  return (
    <section className="dc-section">
      <div className="dc-section-header">
        <div>
          <h2 className="dc-section-title">Votos por posición</h2>
          <p className="dc-section-sub">Marcas recibidas por cada casilla de la papeleta, de mayor a menor</p>
        </div>
      </div>

      <div className="dc-papeleta">
        <img src={papeleta} alt="Papeleta electoral" />
      </div>

      {cargando ? (
        <div className="dc-positions">
          {Array.from({ length: 23 }).map((_, i) => (
            <div key={i} className="dc-pos-card dc-pos-skeleton" />
          ))}
        </div>
      ) : votos.length === 0 ? (
        <p className="dc-empty-inline">No hay votos registrados para esta selección.</p>
      ) : (
        <div className="dc-positions">
          {votos.map((item, index) => (
            <div key={item.casilla} className={`dc-pos-card${index === 0 ? " leader" : ""}`}>
              <span className="dc-pos-rank">{index + 1}</span>
              <span className="dc-pos-casilla">Casilla {item.casilla}</span>
              <span className="dc-pos-votos">{formatNumber(item.votos)}</span>
              <div className="dc-pos-track">
                <div className="dc-pos-fill" style={{ width: `${Math.round((item.votos / maximo) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
