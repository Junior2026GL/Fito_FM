export const allowRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "No tienes permisos para realizar esta acción"
    });
  }

  next();
};
