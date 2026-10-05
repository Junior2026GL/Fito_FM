import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "clave-de-prueba-1234";

vi.mock("../../src/config/env.js", () => ({ env: { JWT_SECRET: "clave-de-prueba-1234" } }));

const execute = vi.fn();
vi.mock("../../src/infrastructure/database/connection.js", () => ({
  pool: { execute: (...args) => execute(...args) }
}));

const { requireAuth } = await import("../../src/shared/middleware/auth.middleware.js");

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

const requestWith = (payload, options = {}) => {
  const token = jwt.sign(payload, SECRET, options);
  return { headers: { authorization: `Bearer ${token}` } };
};

const accountInDb = (account) => execute.mockResolvedValue([[account]]);

describe("requireAuth", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("rechaza peticiones sin token", async () => {
    const res = createRes();
    const next = vi.fn();

    await requireAuth({ headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza un token firmado con otra clave", async () => {
    const res = createRes();
    const next = vi.fn();
    const token = jwt.sign({ sub: 1 }, "otra-clave-distinta");

    await requireAuth({ headers: { authorization: `Bearer ${token}` } }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("acepta un token cuya versión coincide con la de la base de datos", async () => {
    accountInDb({ is_active: 1, token_version: 3 });
    const req = requestWith({ sub: 7, role: "user", ver: 3 });
    const res = createRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user.sub).toBe(7);
  });

  it("rechaza el token cuando la versión cambió (sesión cerrada)", async () => {
    accountInDb({ is_active: 1, token_version: 4 });
    const res = createRes();
    const next = vi.fn();

    await requireAuth(requestWith({ sub: 7, ver: 3 }), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza el token de una cuenta desactivada", async () => {
    accountInDb({ is_active: 0, token_version: 3 });
    const res = createRes();
    const next = vi.fn();

    await requireAuth(requestWith({ sub: 7, ver: 3 }), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza el token de un usuario que ya no existe", async () => {
    execute.mockResolvedValue([[]]);
    const res = createRes();
    const next = vi.fn();

    await requireAuth(requestWith({ sub: 99, ver: 0 }), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("trata un token anterior a la versión como versión 0", async () => {
    accountInDb({ is_active: 1, token_version: 0 });
    const req = requestWith({ sub: 7, role: "admin" });
    const res = createRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("pasa los errores de base de datos al manejador de errores", async () => {
    const dbError = new Error("fallo de conexión");
    execute.mockRejectedValue(dbError);
    const res = createRes();
    const next = vi.fn();

    await requireAuth(requestWith({ sub: 7, ver: 0 }), res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.status).not.toHaveBeenCalled();
  });
});
