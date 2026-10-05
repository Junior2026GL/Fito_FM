import { IconCity, IconMapPin, IconSearch } from "../../../components/icons.jsx";
import { centroKey, centroLabel, formatCiudad } from "../utils.js";

const Filtro = ({ id, label, icon: Icon, value, onChange, disabled, children }) => (
  <div className="dc-filter">
    <label className="dc-filter-label" htmlFor={id}>{label}</label>
    <div className="dc-select">
      <span className="dc-select-icon"><Icon /></span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {children}
      </select>
    </div>
  </div>
);

/**
 * Filtros en cascada: Ciudad → Sector → Centro de votación.
 * Cada lista solo muestra lo que corresponde a lo ya elegido arriba.
 */
export const FiltrosDistrito = ({
  opciones,
  ciudad,
  sector,
  centro,
  sectoresVisibles,
  centrosVisibles,
  onCiudad,
  onSector,
  onCentro,
  onLimpiar,
  disabled
}) => {
  const hayFiltros = Boolean(ciudad || sector || centro);

  return (
    <div className="dc-filters">
      <Filtro id="dc-ciudad" label="Ciudad" icon={IconCity} value={ciudad} onChange={onCiudad} disabled={disabled}>
        <option value="">Todas</option>
        {opciones.ciudades.map((c) => (
          <option key={c} value={c}>{formatCiudad(c)}</option>
        ))}
      </Filtro>

      <Filtro id="dc-sector" label="Sector" icon={IconMapPin} value={sector} onChange={onSector} disabled={disabled}>
        <option value="">Todos</option>
        {sectoresVisibles.map((s) => (
          <option key={s.sector} value={s.sector}>{s.sector}</option>
        ))}
      </Filtro>

      <Filtro id="dc-centro" label="Centro de votación" icon={IconSearch} value={centro} onChange={onCentro} disabled={disabled}>
        <option value="">Todos</option>
        {centrosVisibles.map((c) => (
          <option key={centroKey(c)} value={centroKey(c)}>{centroLabel(c)}</option>
        ))}
      </Filtro>

      <button type="button" className="dc-clear" onClick={onLimpiar} disabled={!hayFiltros}>
        Limpiar
      </button>
    </div>
  );
};
