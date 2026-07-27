import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { HomePage } from "../pages/HomePage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { LoginPage } from "../features/auth/pages/LoginPage.jsx";
import { UsersPage } from "../features/users/pages/UsersPage.jsx";

export const AppRoutes = () => (
  <Routes>
    {/* Pública */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protegidas – requieren autenticación */}
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        {/* Solo administradores */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/usuarios" element={<UsersPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="/inicio" element={<Navigate to="/" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
