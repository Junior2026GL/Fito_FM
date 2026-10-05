import { IconChevronRight } from "../../../components/icons.jsx";
import { formatCiudad, formatNumber } from "../utils.js";

const TITULOS = {
  ciudad: { titulo: "Resumen por ciudad", columna: "Ciudad", ayuda: "Haz clic en una ciudad para ver sus sectores" },
  sector: { titulo: "Resumen por sector", columna: "Sector", ayuda: "Haz clic en un sector para ver sus centros" },
  centro: { titulo: "Resumen por centro de votación", columna: "Sector electoral - Centro", ayuda: "Haz clic en un centro para ver sus urnas" }
};

const SKELETON_COLUMNS = [220, 80, 80, 110, 140];

const Lider = ({ lider }) =>
  lider ? (
    <span className="dt-badge tone-blue">
      Casilla {lider.casilla} · {formatNumber(lider.votos)}
    </span>
  ) : (
    <span className="dt-none">—</span>
  );

/** Tabla del siguiente nivel: ciudades → sectores → centros. Al hacer clic en una fila se baja de nivel. */
export const DesgloseTabla = ({ nivel, desglose, cargando, onSeleccionar }) => {
  const { titulo, columna, ayuda } = TITULOS[nivel];

  // Mientras llega la respuesta nueva no se mezclan filas de otro nivel
  const listo = !cargando && desglose?.nivel === nivel;

  const nombreDe = (fila) => (nivel === "ciudad" ? formatCiudad(fila.nombre) : fila.nombre);

  return (
    <section className="dc-section">
      <div className="dc-section-header">
        <div>
          <h2 className="dc-section-title">{titulo}</h2>
          <p className="dc-section-sub">{ayuda}</p>
        </div>
        {listo && (
          <span className="page-chip">{desglose.filas.length} {desglose.filas.length === 1 ? "fila" : "filas"}</span>
        )}
      </div>

      <div className="dt-table-scroll">
        <table className="dt-table">
          <thead>
            <tr>
              <th>{columna}</th>
              <th className="dc-num">Urnas</th>
              {nivel !== "centro" && <th className="dc-num">Centros</th>}
              <th className="dc-num">Carga electoral</th>
              <th>Casilla líder</th>
              <th aria-label="Ver detalle" />
            </tr>
          </thead>
          <tbody>
            {!listo ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {SKELETON_COLUMNS.map((w, j) => (
                    <td key={j}><div className="skeleton" style={{ width: w, height: 14 }} /></td>
                  ))}
                </tr>
              ))
            ) : desglose.filas.length === 0 ? (
              <tr>
                <td colSpan={6} className="dc-empty-cell">No hay datos para esta selección.</td>
              </tr>
            ) : (
              desglose.filas.map((fila, index) => (
                <tr
                  key={`${fila.nombre}-${index}`}
                  className="dt-row-link"
                  onClick={() => onSeleccionar(fila)}
                >
                  <td className="dc-name">{nombreDe(fila)}</td>
                  <td className="dc-num">{formatNumber(fila.jrv)}</td>
                  {nivel !== "centro" && <td className="dc-num">{formatNumber(fila.centros)}</td>}
                  <td className="dc-num">{formatNumber(fila.carga_electoral)}</td>
                  <td><Lider lider={fila.lider} /></td>
                  <td className="dc-go"><IconChevronRight /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
