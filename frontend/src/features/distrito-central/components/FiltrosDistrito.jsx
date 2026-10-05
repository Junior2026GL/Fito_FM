import { useMemo } from "react";
import { Combobox } from "../../../components/Combobox.jsx";
import { IconCity, IconMapPin, IconSearch } from "../../../components/icons.jsx";
import { centroKey, centroLabel, formatCiudad } from "../utils.js";

const plural = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

const Filtro = ({ id, label, children }) => (
  <div className="dc-filter">
    <label className="dc-filter-label" htmlFor={id}>{label}</label>
    {children}
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

  // Cantidad de sectores por ciudad y de centros por sector, para mostrarlas en la lista
  const sectoresPorCiudad = useMemo(() => {
    const cuenta = new Map();
    opciones.sectores.forEach((s) => cuenta.set(s.ciudad, (cuenta.get(s.ciudad) ?? 0) + 1));
    return cuenta;
  }, [opciones]);

  const centrosPorSector = useMemo(() => {
    const cuenta = new Map();
    opciones.centros.forEach((c) => cuenta.set(c.sector, (cuenta.get(c.sector) ?? 0) + 1));
    return cuenta;
  }, [opciones]);

  const opcionesCiudad = useMemo(
    () =>
      opciones.ciudades.map((c) => ({
        value: c,
        label: formatCiudad(c),
        hint: plural(sectoresPorCiudad.get(c) ?? 0, "sector", "sectores")
      })),
    [opciones, sectoresPorCiudad]
  );

  const opcionesSector = useMemo(
    () =>
      sectoresVisibles.map((s) => ({
        value: s.sector,
        label: s.sector,
        hint: plural(centrosPorSector.get(s.sector) ?? 0, "centro", "centros")
      })),
    [sectoresVisibles, centrosPorSector]
  );

  const opcionesCentro = useMemo(
    () =>
      centrosVisibles.map((c) => ({
        value: centroKey(c),
        label: c.sector_electoral,
        sublabel: c.centro,
        hint: c.sector,
        triggerLabel: centroLabel(c)
      })),
    [centrosVisibles]
  );

  return (
    <div className="dc-filters">
      <Filtro id="dc-ciudad" label="Ciudad">
        <Combobox
          id="dc-ciudad"
          icon={IconCity}
          value={ciudad}
          onChange={onCiudad}
          options={opcionesCiudad}
          allLabel="Todas"
          disabled={disabled}
        />
      </Filtro>

      <Filtro id="dc-sector" label="Sector">
        <Combobox
          id="dc-sector"
          icon={IconMapPin}
          value={sector}
          onChange={onSector}
          options={opcionesSector}
          allLabel="Todos"
          disabled={disabled}
        />
      </Filtro>

      <Filtro id="dc-centro" label="Centro de votación">
        <Combobox
          id="dc-centro"
          icon={IconSearch}
          value={centro}
          onChange={onCentro}
          options={opcionesCentro}
          allLabel="Todos"
          searchable
          searchPlaceholder="Buscar sector electoral o centro..."
          emptyText="No hay centros con ese texto"
          disabled={disabled}
        />
      </Filtro>

      <button type="button" className="dc-clear" onClick={onLimpiar} disabled={!hayFiltros}>
        Limpiar
      </button>
    </div>
  );
};
