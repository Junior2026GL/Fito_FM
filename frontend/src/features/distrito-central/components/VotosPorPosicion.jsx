import papeleta from "../../../assets/papeleta.png";
import { formatNumber } from "../utils.js";

// Relleno lateral de cada tarjeta (padding + borde) y ancho mínimo de una columna
const CARD_PADDING = 14;
const MIN_COLUMN = 44;

// Tamaño del número de votos según su cantidad de caracteres: los totales grandes (ej. 193,560)
// se achican un poco para que las 23 columnas quepan en una pantalla de 1920 px
const tamanoVotos = (caracteres) => (caracteres >= 7 ? 0.66 : caracteres === 6 ? 0.7 : 0.75);

/**
 * Marcas por posición, con el mismo formato del detalle de Diputados:
 * papeleta arriba, fila de posiciones 1–23 y las 23 casillas en una sola línea
 * ordenadas de mayor a menor. En pantallas angostas se desplaza horizontalmente.
 */
export const VotosPorPosicion = ({ votos, cargando }) => {
  const maximo = votos[0]?.votos || 1;

  // Los totales grandes (ej. 193,560) necesitan columnas más anchas que los de un centro (ej. 1,145)
  const caracteres = formatNumber(maximo).length;
  const tamano = tamanoVotos(caracteres);
  const columna = Math.max(MIN_COLUMN, Math.ceil(caracteres * tamano * 16 * 0.6) + CARD_PADDING);

  return (
    <section className="dc-section">
      <div className="dc-section-header">
        <div>
          <h2 className="dc-section-title">Votos por posición</h2>
          <p className="dc-section-sub">Marcas recibidas por cada casilla de la papeleta, de mayor a menor</p>
        </div>
      </div>

      <div className="dc-votos-scroll">
        <div className="dc-votos-inner" style={{ "--dc-col-min": `${columna}px`, "--dc-votos-size": `${tamano}rem` }}>
          <div className="modal-papeleta-banner">
            <img src={papeleta} alt="Papeleta electoral" className="modal-papeleta-img" />
          </div>

          {cargando ? (
            <div className="casillas-skeleton">
              {Array.from({ length: 23 }).map((_, i) => (
                <div key={i} className="casilla-card-skeleton" />
              ))}
            </div>
          ) : votos.length === 0 ? (
            <p className="dc-empty-inline">No hay votos registrados para esta selección.</p>
          ) : (
            <>
              <div className="casillas-pos-row">
                {votos.map((_, index) => (
                  <div key={index} className="casilla-pos-box">{index + 1}</div>
                ))}
              </div>

              <div className="casillas-grid">
                {votos.map((item) => (
                  <div key={item.casilla} className="casilla-card">
                    <span className="casilla-numero">{item.casilla}</span>
                    <span className="casilla-votos">{formatNumber(item.votos)}</span>
                    <div className="casilla-bar-track">
                      <div
                        className="casilla-bar-fill"
                        style={{ width: `${Math.round((item.votos / maximo) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
