export const hasModuleAccess = (user, moduleKey) =>
  user?.role === "admin" || Boolean(user?.modules?.includes(moduleKey));
