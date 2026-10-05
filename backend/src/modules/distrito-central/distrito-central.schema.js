import { z } from "zod";

// Las cadenas vacías (filtro "Todos") se tratan como si no se hubiera enviado el filtro
const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => value || undefined);

export const filtrosSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({})
});

export const resumenSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z
    .object({
      ciudad: optionalText,
      sector: optionalText,
      sector_electoral: optionalText,
      centro: optionalText
    })
    .refine((query) => !query.centro || query.sector_electoral, {
      message: "El centro de votación requiere su sector electoral",
      path: ["sector_electoral"]
    })
});
