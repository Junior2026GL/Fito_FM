import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("límite de peticiones y compresión", () => {
  let app;

  beforeAll(async () => {
    // Variables propias de la prueba, para no depender del archivo .env
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("API_RATE_LIMIT_MAX", "3");
    vi.stubEnv("DB_HOST", "localhost");
    vi.stubEnv("DB_NAME", "fito_fm_test");
    vi.stubEnv("DB_USER", "test");
    vi.stubEnv("JWT_SECRET", "clave-de-prueba-1234");
    vi.resetModules();

    const { createApp } = await import("../../src/app.js");
    app = createApp();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("responde 429 cuando una IP supera el máximo por minuto", async () => {
    const statuses = [];

    for (let i = 0; i < 5; i += 1) {
      const response = await request(app).get("/api/users");
      statuses.push(response.status);
    }

    // Sin token las 3 primeras son 401; a partir de la cuarta, el límite
    expect(statuses).toEqual([401, 401, 401, 429, 429]);
  });

  it("incluye el mensaje y las cabeceras estándar de límite", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Demasiadas peticiones/);
    expect(response.headers["ratelimit-policy"] ?? response.headers.ratelimit).toBeDefined();
  });

  it("nunca limita el endpoint de salud", async () => {
    for (let i = 0; i < 6; i += 1) {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
    }
  });

  it("negocia la compresión de las respuestas", async () => {
    const response = await request(app).get("/api/health").set("Accept-Encoding", "gzip");

    expect(response.headers.vary).toMatch(/Accept-Encoding/i);
  });
});
