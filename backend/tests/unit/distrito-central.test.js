import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/infrastructure/database/connection.js", () => ({
  pool: { execute: vi.fn(), query: vi.fn() }
}));

const repository = await import("../../src/modules/distrito-central/distrito-central.repository.js");
const { pickLeader, getNivelDesglose, getResumen, getFiltros } = await import(
  "../../src/modules/distrito-central/distrito-central.service.js"
);
const { resumenSchema } = await import("../../src/modules/distrito-central/distrito-central.schema.js");

const { CASILLAS } = repository;

// Fila con marcas en casillas concretas; el resto en cero
const fila = (marcas = {}, extra = {}) => ({
  ...Object.fromEntries(CASILLAS.map((n) => [`c${n}`, 0])),
  ...Object.fromEntries(Object.entries(marcas).map(([n, v]) => [`c${n}`, v])),
  ...extra
});

describe("pickLeader", () => {
  it("devuelve la casilla con más marcas", () => {
    expect(pickLeader(fila({ 93: 10, 100: 55, 110: 20 }))).toEqual({ casilla: 100, votos: 55 });
  });

  it("devuelve null cuando no hay marcas", () => {
    expect(pickLeader(fila())).toBeNull();
  });

  it("en un empate se queda con la primera casilla", () => {
    expect(pickLeader(fila({ 95: 7, 101: 7 }))).toEqual({ casilla: 95, votos: 7 });
  });

  it("acepta cantidades que llegan como texto (SUM de MySQL)", () => {
    expect(pickLeader(fila({ 93: "1200" }))).toEqual({ casilla: 93, votos: 1200 });
  });
});

describe("getNivelDesglose", () => {
  it("baja un nivel según el filtro más específico", () => {
    expect(getNivelDesglose({})).toBe("ciudad");
    expect(getNivelDesglose({ ciudad: "TEGUCIGALPA" })).toBe("sector");
    expect(getNivelDesglose({ ciudad: "TEGUCIGALPA", sector: "T 5" })).toBe("centro");
    expect(getNivelDesglose({ sector: "T 5", sector_electoral: "BO. X", centro: "ESC. Y" })).toBe("urna");
  });
});

describe("resumenSchema", () => {
  const parse = (query) => resumenSchema.safeParse({ body: {}, params: {}, query });

  it("trata los filtros vacíos como 'Todos'", () => {
    const result = parse({ ciudad: "", sector: "  " });
    expect(result.success).toBe(true);
    expect(result.data.query.ciudad).toBeUndefined();
    expect(result.data.query.sector).toBeUndefined();
  });

  it("exige el sector electoral cuando se envía el centro", () => {
    expect(parse({ centro: "ESC. CENTRO AMERICA" }).success).toBe(false);
    expect(parse({ centro: "ESC. CENTRO AMERICA", sector_electoral: "BO. ABAJO" }).success).toBe(true);
  });

  it("rechaza textos demasiado largos", () => {
    expect(parse({ ciudad: "x".repeat(201) }).success).toBe(false);
  });
});

describe("getFiltros", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("arma ciudades, sectores y centros sin duplicados", async () => {
    vi.spyOn(repository, "getOpcionesFiltros").mockResolvedValue([
      { ciudad: "ALDEAS", sector: "A1", sector_electoral: "AGUA", centro: "ESC. 1" },
      { ciudad: "ALDEAS", sector: "A1", sector_electoral: "CERRO", centro: "ESC. 2" },
      { ciudad: "TEGUCIGALPA", sector: "T 1", sector_electoral: "BO. ABAJO", centro: "ESC. 3" }
    ]);

    const result = await getFiltros();

    expect(result.ciudades).toEqual(["ALDEAS", "TEGUCIGALPA"]);
    expect(result.sectores).toEqual([
      { ciudad: "ALDEAS", sector: "A1" },
      { ciudad: "TEGUCIGALPA", sector: "T 1" }
    ]);
    expect(result.centros).toHaveLength(3);
  });
});

describe("getResumen", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("une la carga electoral con las marcas de cada ciudad", async () => {
    vi.spyOn(repository, "getTotales").mockResolvedValue({
      votos: fila({ 93: 300, 94: 100 }, { total_jrv: "30" }),
      centros: { total_centros: "5", carga_electoral: "9000" }
    });
    vi.spyOn(repository, "getDesglosePorNivel").mockResolvedValue([
      fila({ 93: 200 }, { ciudad: "ALDEAS", jrv: "10" }),
      fila({ 93: 100, 94: 100 }, { ciudad: "TEGUCIGALPA", jrv: "20" })
    ]);
    vi.spyOn(repository, "getCargaPorNivel").mockResolvedValue([
      { ciudad: "ALDEAS", centros: "2", carga_electoral: "3000" },
      { ciudad: "TEGUCIGALPA", centros: "3", carga_electoral: "6000" }
    ]);

    const result = await getResumen({});

    expect(result.totales).toEqual({ total_jrv: 30, total_centros: 5, carga_electoral: 9000 });
    expect(result.votos[0]).toEqual({ casilla: 93, votos: 300 });
    expect(result.desglose.nivel).toBe("ciudad");
    expect(result.desglose.filas).toEqual([
      { ciudad: "ALDEAS", nombre: "ALDEAS", jrv: 10, centros: 2, carga_electoral: 3000, lider: { casilla: 93, votos: 200 } },
      { ciudad: "TEGUCIGALPA", nombre: "TEGUCIGALPA", jrv: 20, centros: 3, carga_electoral: 6000, lider: { casilla: 93, votos: 100 } }
    ]);
  });

  it("al elegir un centro lista sus urnas", async () => {
    vi.spyOn(repository, "getTotales").mockResolvedValue({
      votos: fila({ 95: 40 }, { total_jrv: "2" }),
      centros: { total_centros: "1", carga_electoral: "1500" }
    });
    vi.spyOn(repository, "getUrnas").mockResolvedValue([
      fila({ 95: 25 }, { urna: 9977 }),
      fila({ 95: 15 }, { urna: 9978 })
    ]);

    const result = await getResumen({ sector: "T 5", sector_electoral: "BO. X", centro: "ESC. Y" });

    expect(result.desglose.nivel).toBe("urna");
    expect(result.desglose.filas.map((u) => u.nombre)).toEqual(["Urna 9977", "Urna 9978"]);
    expect(result.desglose.filas[0].lider).toEqual({ casilla: 95, votos: 25 });
  });

  it("con un alcance sin datos devuelve todo vacío", async () => {
    vi.spyOn(repository, "getTotales").mockResolvedValue({
      votos: fila({}, { total_jrv: 0 }),
      centros: { total_centros: 0, carga_electoral: 0 }
    });
    vi.spyOn(repository, "getDesglosePorNivel").mockResolvedValue([]);
    vi.spyOn(repository, "getCargaPorNivel").mockResolvedValue([]);

    const result = await getResumen({ ciudad: "INEXISTENTE" });

    expect(result.totales.total_jrv).toBe(0);
    expect(result.votos).toEqual([]);
    expect(result.desglose.filas).toEqual([]);
  });
});
