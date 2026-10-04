import { useAuth } from "../features/auth/context/AuthContext.jsx";

const formatToday = () => {
  const text = new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const HomePage = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  return (
    <section className="home-hero">
      <div>
        <p className="home-hero-eyebrow">Panel principal</p>
        <h1 className="home-hero-title">Bienvenido, {firstName}</h1>
        <p className="home-hero-text">
          Usa el menú lateral para acceder a los módulos disponibles para tu cuenta.
        </p>
      </div>
      <div className="home-hero-date">{formatToday()}</div>
    </section>
  );
};
