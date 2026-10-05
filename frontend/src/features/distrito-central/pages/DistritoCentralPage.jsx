import { useEffect, useMemo, useState } from "react";
import { getFiltros, getResumen } from "../services/distrito-central.service.js";
import { FiltrosDistrito } from "../components/FiltrosDistrito.jsx";
import { VotosPorPosicion } from "../components/VotosPorPosicion.jsx";
import { DesgloseTabla } from "../components/DesgloseTabla.jsx";
import { UrnasModal } from "../components/UrnasModal.jsx";
import { centroKey, centroLabel, formatCiudad, formatNumber } from "../utils.js";
import { IconAlert, IconCheck, IconCity, IconInbox, IconList, IconMap, IconUsers } from "../../../components/icons.jsx";

const Kpi = ({ label, value, color, icon, cargando }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ background: color + "18", color }}>{icon}</div>
    <div className="stat-card-body">
      {cargando ? (
        <>
          <div className="skeleton" style={{ width: 90, height: 22, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 120, height: 12 }} />
        </>
      ) : (
        <>
          <div className="stat-value" style={{ color }}>{formatNumber(value)}</div>
          <div className="stat-label">{label}</div>
        </>
      )}
    </div>
  </div>
);

export const DistritoCentralPage = () => {
  const [opciones, setOpciones] = useState(null);
  const [errorOpciones, setErrorOpciones] = useState("");

  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [centro, setCentro] = useState("");

  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [urnasAbiertas, setUrnasAbiertas] = useState(false);

  // Opciones de los desplegables (una sola vez)
  useEffect(() => {
    let cancelado = false;

    getFiltros()
      .then((data) => { if (!cancelado) setOpciones(data); })
      .catch(() => { if (!cancelado) setErrorOpciones("No se pudieron cargar los filtros."); });

    return () => { cancelado = true; };
  }, [intento]);

  const centroSeleccionado = useMemo(
    () => opciones?.centros.find((c) => centroKey(c) === centro) ?? null,
    [opciones, centro]
  );

  // Cada lista solo muestra lo que corresponde a lo elegido arriba
  const sectoresVisibles = useMemo(
    () => (opciones?.sectores ?? []).filter((s) => !ciudad || s.ciudad === ciudad),
    [opciones, ciudad]
  );

  const centrosVisibles = useMemo(
    () =>
      (opciones?.centros ?? [])
        .filter((c) => (!ciudad || c.ciudad === ciudad) && (!sector || c.sector === sector))
        .sort((a, b) => centroLabel(a).localeCompare(centroLabel(b), "es")),
    [opciones, ciudad, sector]
  );

  // Resultados: se consultan solos cada vez que cambia un filtro
  useEffect(() => {
    if (!opciones) return undefined;

    let cancelado = false;
    setCargando(true);
    setError("");
    setUrnasAbiertas(false);

    getResumen({
      ciudad,
      sector,
      sector_electoral: centroSeleccionado?.sector_electoral,
      centro: centroSeleccionado?.centro
    })
      .then((data) => { if (!cancelado) setResumen(data); })
      .catch(() => { if (!cancelado) setError("No se pudieron cargar los resultados."); })
      .finally(() => { if (!cancelado) setCargando(false); });

    return () => { cancelado = true; };
  }, [opciones, ciudad, sector, centroSeleccionado, intento]);

  // Al elegir algo más específico, los niveles superiores se completan solos
  const elegirCiudad = (valor) => {
    setCiudad(valor);
    setSector("");
    setCentro("");
  };

  const elegirSector = (valor) => {
    setSector(valor);
    setCentro("");
    if (valor) {
      const encontrado = opciones.sectores.find((s) => s.sector === valor);
      if (encontrado) setCiudad(encontrado.ciudad);
    }
  };

  const elegirCentro = (valor) => {
    setCentro(valor);
    const encontrado = opciones.centros.find((c) => centroKey(c) === valor);
    if (encontrado) {
      setCiudad(encontrado.ciudad);
      setSector(encontrado.sector);
    }
  };

  const limpiar = () => {
    setCiudad("");
    setSector("");
    setCentro("");
  };

  // Clic en una fila del desglose: baja al siguiente nivel
  const bajarNivel = (fila) => {
    if (fila.centro) elegirCentro(centroKey(fila));
    else if (fila.sector) elegirSector(fila.sector);
    else if (fila.ciudad) elegirCiudad(fila.ciudad);
  };

  const migas = [
    { texto: "Distrito Central", onClick: limpiar, activa: !ciudad && !sector && !centro },
    ciudad && { texto: formatCiudad(ciudad), onClick: () => elegirCiudad(ciudad), activa: !sector && !centro },
    sector && { texto: sector, onClick: () => elegirSector(sector), activa: !centro },
    centroSeleccionado && { texto: centroLabel(centroSeleccionado), activa: true }
  ].filter(Boolean);

  const totales = resumen?.totales;
  const sinDatos = !cargando && !error && totales?.total_jrv === 0;

  // Nivel que corresponde a los filtros actuales (igual que en el backend). Al elegir un centro
  // no se muestra una tabla de urnas: se ofrece un botón que las abre en una ventana.
  const nivelActual = centroSeleccionado ? "urna" : sector ? "centro" : ciudad ? "sector" : "ciudad";

  // Sin filtros solo se ven los totales; la papeleta y los resultados aparecen al filtrar
  const hayFiltro = Boolean(ciudad || sector || centro);
  const urnasListas = !cargando && resumen?.desglose?.nivel === "urna";
  const urnas = urnasListas ? resumen.desglose.filas : [];

  return (
    <>
      <div className="dt-header">
        <div className="dt-header-main">
          <span className="dt-header-icon"><IconCity /></span>
          <div>
            <h1 className="page-title">Distrito Central</h1>
            <p className="page-subtitle">Resultados de diputados por ciudad, sector y centro de votación</p>
          </div>
        </div>
      </div>

      {errorOpciones ? (
        <div className="alert alert-error">
          <span className="alert-icon"><IconAlert /></span>
          {errorOpciones}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={() => { setErrorOpciones(""); setIntento((n) => n + 1); }}>
            Reintentar
          </button>
        </div>
      ) : !opciones ? (
        <div className="dc-filters">
          <div className="skeleton" style={{ height: 70, gridColumn: "1 / -1" }} />
        </div>
      ) : (
        <FiltrosDistrito
          opciones={opciones}
          ciudad={ciudad}
          sector={sector}
          centro={centro}
          sectoresVisibles={sectoresVisibles}
          centrosVisibles={centrosVisibles}
          onCiudad={elegirCiudad}
          onSector={elegirSector}
          onCentro={elegirCentro}
          onLimpiar={limpiar}
        />
      )}

      {opciones && (
        <nav className="dc-breadcrumb" aria-label="Alcance de la consulta">
          {migas.map((miga, index) => (
            <span key={miga.texto} className="dc-crumb-wrap">
              {index > 0 && <span className="dc-crumb-sep" aria-hidden="true">›</span>}
              {miga.activa || !miga.onClick ? (
                <span className="dc-crumb active">{miga.texto}</span>
              ) : (
                <button type="button" className="dc-crumb" onClick={miga.onClick}>{miga.texto}</button>
              )}
            </span>
          ))}
        </nav>
      )}

      {error ? (
        <div className="alert alert-error">
          <span className="alert-icon"><IconAlert /></span>
          {error}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }} onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      ) : sinDatos ? (
        <div className="dc-section dc-empty">
          <span className="dt-empty-icon"><IconInbox /></span>
          <p className="dt-empty-title">Sin resultados</p>
          <p className="dt-empty-text">No hay datos para la selección actual.</p>
        </div>
      ) : opciones && (
        <>
          <div className="dc-kpis">
            <Kpi label="Carga electoral" value={totales?.carga_electoral} color="#7c3aed" icon={<IconUsers />} cargando={cargando} />
            <Kpi label="Urnas (JRV)" value={totales?.total_jrv} color="#15803d" icon={<IconCheck />} cargando={cargando} />
            <Kpi label="Centros de votación" value={totales?.total_centros} color="#1d4ed8" icon={<IconMap />} cargando={cargando} />
          </div>

          {!hayFiltro ? (
            <p className="dc-hint">
              Elige una ciudad, un sector o un centro de votación para ver la papeleta y los resultados.
            </p>
          ) : (
            <>
              <VotosPorPosicion votos={resumen?.votos ?? []} cargando={cargando} />

              {nivelActual === "urna" ? (
                <section className="dc-section dc-urnas-cta">
                  <span className="dc-urnas-cta-icon"><IconList /></span>
                  <div className="dc-urnas-cta-text">
                    <h2 className="dc-section-title">Urnas del centro</h2>
                    <p className="dc-section-sub">
                      {urnasListas
                        ? `Este centro tiene ${urnas.length} ${urnas.length === 1 ? "urna" : "urnas"}. Consulta la casilla líder de cada una.`
                        : "Cargando urnas..."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setUrnasAbiertas(true)}
                    disabled={!urnasListas || urnas.length === 0}
                  >
                    <IconList />
                    Ver urnas del centro
                  </button>
                </section>
              ) : nivelActual !== "sector" && (
                <DesgloseTabla
                  nivel={nivelActual}
                  desglose={resumen?.desglose}
                  cargando={cargando}
                  onSeleccionar={bajarNivel}
                />
              )}

              {urnasAbiertas && urnasListas && centroSeleccionado && (
                <UrnasModal
                  centro={centroLabel(centroSeleccionado)}
                  urnas={urnas}
                  onClose={() => setUrnasAbiertas(false)}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
