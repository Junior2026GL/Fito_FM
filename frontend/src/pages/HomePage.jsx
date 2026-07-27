import { useAuth } from "../features/auth/context/AuthContext.jsx";

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <section className="card">
      <p className="eyebrow">Panel principal</p>
      <h1>Hola, {user?.name?.split(" ")[0]} 👋</h1>
      <p>
        Bienvenido a <strong>fito_fm</strong>. Usa el menú superior para navegar
        por las secciones disponibles.
      </p>
    </section>
  );
};
