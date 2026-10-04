import geoData from "./francisco_morazan.json";

// Nombres legibles — deben coincidir exactamente con la columna Municipio en la DB
export const MUNICIPIO_LABELS = {
  Alubarén: "Alubarén",
  Cedros: "Cedros",
  Curarén: "Curarén",
  DistritoCentral: "Distrito Central",
  ElPorvenir: "El Porvenir",
  Guaimaca: "Guaimaca",
  LaLibertad: "La Libertad",
  LaVenta: "La Venta",
  Lepaterique: "Lepaterique",
  Maraita: "Maraita",
  Marale: "Marale",
  NuevaArmenia: "Nueva Armenia",
  Ojojona: "Ojojona",
  Orica: "Orica",
  Reitoca: "Reitoca",
  Sabanagrande: "Sabanagrande",
  SanAntoniodeOriente: "San Antonio de Oriente",
  SanBuenaventura: "San Buenaventura",
  SanIgnacio: "San Ignacio",
  SanJuandeFlores: "Cantarranas",          // antes: San Juan de Flores
  SanMiguelito: "San Miguelito",
  SantaAna: "Santa Ana",
  SantaLucía: "Santa Lucía",
  Talanga: "Talanga",
  Tatumbla: "Tatumbla",
  "ValledeÁngeles": "Valle de Ángeles",
  Vallecillo: "Vallecillos",               // DB usa plural
  VilladeSanFrancisco: "Villa San Francisco", // DB sin "de"
};

export const getMunicipioLabel = (key) => MUNICIPIO_LABELS[key] || key;

// Lista ordenada alfabéticamente para el panel lateral
export const MUNICIPIOS = geoData.features
  .map((feature) => ({
    key: feature.properties.NAME_2,
    label: getMunicipioLabel(feature.properties.NAME_2)
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "es"));
