import { AppError } from "../../shared/errors/app-error.js";
import * as repository from "./jrv.repository.js";

export const buscar = (urna) => repository.buscarPorUrna(urna);

/** Actualiza los votos de una JRV y devuelve los valores anteriores y los nuevos solo de lo que cambió. */
export const actualizarVotos = async ({ votos, ...identidad }) => {
  const coincidencias = await repository.contarCoincidencias(identidad);

  if (coincidencias === 0) throw new AppError("No se encontró la JRV indicada", 404);
  if (coincidencias > 1) {
    throw new AppError(
      "Hay más de una JRV con la misma urna, sector electoral y centro; no se puede editar sin riesgo",
      409
    );
  }

  const antes = await repository.obtenerVotos(identidad);
  const cambios = Object.fromEntries(
    Object.entries(votos).filter(([casilla, valor]) => (antes[`c${casilla}`] ?? null) !== valor)
  );

  if (Object.keys(cambios).length === 0) return { cambios: {}, anterior: {} };

  await repository.actualizarVotos(identidad, cambios);

  const anterior = Object.fromEntries(
    Object.keys(cambios).map((casilla) => [casilla, antes[`c${casilla}`] ?? null])
  );
  return { cambios, anterior };
};
