import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { HomePage } from "../pages/HomePage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { LoginPage } from "../features/auth/pages/LoginPage.jsx";
import { UsersPage } from "../features/users/pages/UsersPage.jsx";
import { DiputadosPage } from "../features/diputados/pages/DiputadosPage.jsx";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage.jsx";
import { AuditoriaPage } from "../features/auditoria/pages/AuditoriaPage.jsx";

export const AppRoutes = () => (
  <Routes>
    {/* Pública */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protegidas – requieren autenticación */}
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        {/* Requiere el módulo "dashboard" */}
        <Route element={<ProtectedRoute requiredModule="dashboard" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Requiere el módulo "diputados" */}
        <Route element={<ProtectedRoute requiredModule="diputados" />}>
          <Route path="/diputados" element={<DiputadosPage />} />
        </Route>

        {/* Requiere el módulo "auditoria" */}
        <Route element={<ProtectedRoute requiredModule="auditoria" />}>
          <Route path="/auditoria" element={<AuditoriaPage />} />
        </Route>

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
