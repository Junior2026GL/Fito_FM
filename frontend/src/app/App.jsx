import { AuthProvider } from "../features/auth/context/AuthContext.jsx";
import { AppRoutes } from "./router.jsx";

export const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};
