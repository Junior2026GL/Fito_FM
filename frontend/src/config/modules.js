// Módulos asignables por usuario desde la pantalla de Usuarios (aparte del rol admin)
export const AVAILABLE_MODULES = [
  { key: "diputados", label: "Diputados" },
];

export const hasModuleAccess = (user, moduleKey) =>
  user?.role === "admin" || Boolean(user?.modules?.includes(moduleKey));
