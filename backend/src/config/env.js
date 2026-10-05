import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  // Cantidad de proxies delante de la app (para obtener la IP real del cliente).
  // Si no se define: 1 en producción (hosting con proxy) y 0 en desarrollo.
  TRUST_PROXY: z.coerce.number().int().min(0).optional(),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(""),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("8h"),

  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10)
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Variables de entorno inválidas:", result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
