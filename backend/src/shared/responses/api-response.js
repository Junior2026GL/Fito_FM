export const successResponse = (
  res,
  {
    statusCode = 200,
    message = "Operación realizada correctamente",
    data = null,
    meta = undefined
  } = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {})
  });
};
