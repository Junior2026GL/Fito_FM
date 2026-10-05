import * as repository from "./distrito-central.repository.js";

const { CASILLAS } = repository;

// Casilla con más marcas dentro de una fila; null si no hay ninguna marca
export const pickLeader = (row) => {
  let leader = null;

  for (const casilla of CASILLAS) {
    const votos = Number(row[`c${casilla}`]) || 0;
    if (votos > 0 && (!leader || votos > leader.votos)) {
      leader = { casilla, votos };
    }
  }

  return leader;
};

// Nivel que se muestra en el desglose según hasta dónde se filtró
export const getNivelDesglose = ({ ciudad, sector, centro }) => {
  if (centro) return "urna";
  if (sector) return "centro";
  if (ciudad) return "sector";
  return "ciudad";
};

const sumVotos = (row) =>
  CASILLAS.map((casilla) => ({ casilla, votos: Number(row[`c${casilla}`]) || 0 }))
    .sort((a, b) => b.votos - a.votos || a.casilla - b.casilla);

// Estructura de los filtros en cascada: ciudades → sectores → centros
export const getFiltros = async () => {
  const rows = await repository.getOpcionesFiltros();

  const ciudades = [...new Set(rows.map((r) => r.ciudad))];
  const sectores = [
    ...new Map(rows.map((r) => [`${r.ciudad}|${r.sector}`, { ciudad: r.ciudad, sector: r.sector }])).values()
  ];
  const centros = rows.map((r) => ({
    ciudad: r.ciudad,
    sector: r.sector,
    sector_electoral: r.sector_electoral,
    centro: r.centro
  }));

  return { ciudades, sectores, centros };
};

const identificadoresDeFila = (nivel, row) => {
  if (nivel === "ciudad") return { ciudad: row.ciudad };
  if (nivel === "sector") return { sector: row.sector };
  return { sector_electoral: row.sector_electoral, centro: row.centro };
};

const claveDeFila = (nivel, row) =>
  nivel === "centro" ? `${row.sector_electoral}|${row.centro}` : String(row[nivel]);

const nombreDeFila = (nivel, row) => {
  if (nivel === "ciudad") return row.ciudad;
  if (nivel === "sector") return row.sector;
  return `${row.sector_electoral} - ${row.centro}`;
};

const getDesglose = async (nivelDesglose, filtros) => {
  if (nivelDesglose === "urna") {
    const urnas = await repository.getUrnas(filtros);

    return {
      nivel: "urna",
      filas: urnas.map((row) => ({
        nombre: `Urna ${row.urna}`,
        urna: row.urna,
        lider: pickLeader(row)
      }))
    };
  }

  const [grupos, cargas] = await Promise.all([
    repository.getDesglosePorNivel(nivelDesglose, filtros),
    repository.getCargaPorNivel(nivelDesglose, filtros)
  ]);

  const cargaPorClave = new Map(cargas.map((c) => [claveDeFila(nivelDesglose, c), c]));

  return {
    nivel: nivelDesglose,
    filas: grupos.map((row) => {
      const carga = cargaPorClave.get(claveDeFila(nivelDesglose, row));

      return {
        ...identificadoresDeFila(nivelDesglose, row),
        nombre: nombreDeFila(nivelDesglose, row),
        jrv: Number(row.jrv) || 0,
        centros: Number(carga?.centros) || 0,
        carga_electoral: Number(carga?.carga_electoral) || 0,
        lider: pickLeader(row)
      };
    })
  };
};

export const getResumen = async (filtros) => {
  const nivelDesglose = getNivelDesglose(filtros);

  const [{ votos, centros }, desglose] = await Promise.all([
    repository.getTotales(filtros),
    getDesglose(nivelDesglose, filtros)
  ]);

  return {
    alcance: {
      ciudad: filtros.ciudad ?? null,
      sector: filtros.sector ?? null,
      sector_electoral: filtros.sector_electoral ?? null,
      centro: filtros.centro ?? null
    },
    totales: {
      total_jrv: Number(votos.total_jrv) || 0,
      total_centros: Number(centros.total_centros) || 0,
      carga_electoral: Number(centros.carga_electoral) || 0
    },
    votos: Number(votos.total_jrv) ? sumVotos(votos) : [],
    desglose
  };
};
