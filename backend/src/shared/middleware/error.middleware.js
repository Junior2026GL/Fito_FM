import { env } from "../../config/env.js";

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Error interno del servidor",
    ...(error.details ? { errors: error.details } : {}),
    ...(env.NODE_ENV === "development" && !error.isOperational
      ? { stack: error.stack }
      : {})
  });
};
