// Autoriza si el usuario es admin o si tiene el módulo asignado en su token
export const requireModule = (moduleKey) => (req, res, next) => {
  const isAdmin = req.user?.role === "admin";
  const hasModule = Array.isArray(req.user?.modules) && req.user.modules.includes(moduleKey);

  if (!isAdmin && !hasModule) {
    return res.status(403).json({
      success: false,
      message: "No tienes acceso a este módulo"
    });
  }

  next();
};
