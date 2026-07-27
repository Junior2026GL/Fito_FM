import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <section className="card">
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
};
