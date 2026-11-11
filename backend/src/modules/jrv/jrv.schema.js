import { z } from "zod";

const casillasPermitidas = new Set(Array.from({ length: 23 }, (_, i) => String(93 + i)));

export const buscarSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    urna: z.coerce.number().int().min(0).max(2147483647)
  })
});

const texto = z.string().trim().min(1).max(200);

export const actualizarSchema = z.object({
  body: z.object({
    urna: z.coerce.number().int().min(0).max(2147483647),
    municipio: texto,
    sector_electoral: texto,
    centro: texto,
    // { "93": 12, "94": 0, ... }: solo enteros no negativos y solo casillas 93–115
    votos: z
      .record(z.string(), z.coerce.number().int().min(0).max(1000000))
      .refine((votos) => Object.keys(votos).length > 0, { message: "No hay votos para guardar" })
      .refine((votos) => Object.keys(votos).every((k) => casillasPermitidas.has(k)), {
        message: "Casilla no válida"
      })
  }),
  params: z.object({}),
  query: z.object({})
});
