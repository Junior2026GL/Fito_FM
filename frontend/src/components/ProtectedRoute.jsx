import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext.jsx";
import { hasModuleAccess } from "../config/modules.js";

/**
 * Protege rutas que requieren autenticación.
 * @param {string[]} [allowedRoles] – Si se provee, sólo usuarios con ese rol pueden acceder.
 * @param {string} [requiredModule] – Si se provee, solo usuarios con ese módulo (o admin) pueden acceder.
 */
export const ProtectedRoute = ({ allowedRoles, requiredModule }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if (requiredModule && !hasModuleAccess(user, requiredModule)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
