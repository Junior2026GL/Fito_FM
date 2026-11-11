import { asyncHandler } from "../../shared/utils/async-handler.js";
import { successResponse } from "../../shared/responses/api-response.js";
import * as auditoriaService from "../auditoria/auditoria.service.js";
import * as service from "./jrv.service.js";

export const buscar = asyncHandler(async (req, res) => {
  const data = await service.buscar(req.validated.query.urna);
  return successResponse(res, { data });
});

export const actualizar = asyncHandler(async (req, res) => {
  const body = req.validated.body;
  const { cambios, anterior } = await service.actualizarVotos(body);

  if (Object.keys(cambios).length > 0) {
    await auditoriaService.logEvent({
      userId: req.user.sub,
      userName: req.user.name,
      action: "update",
      entity: "jrv",
      entityId: body.urna,
      details: {
        name: `Urna ${body.urna}`,
        municipio: body.municipio,
        centro: body.centro,
        anterior,
        nuevo: cambios
      },
      ipAddress: req.ip
    });
  }

  return successResponse(res, {
    message: Object.keys(cambios).length ? "JRV actualizada correctamente" : "No había cambios que guardar",
    data: { cambios }
  });
});
