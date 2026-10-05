import { Component } from "react";
import { IconAlertTriangle, IconHome, IconRefresh } from "./icons.jsx";

/**
 * Evita la pantalla en blanco cuando un componente falla al dibujarse.
 * - variant="page": pantalla completa (error global).
 * - variant="section": solo el área de contenido; el menú y el header siguen funcionando.
 * `resetKey` limpia el error cuando cambia (por ejemplo, al navegar a otra ruta).
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error de interfaz:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    if (this.props.variant === "page") {
      window.location.reload();
      return;
    }

    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    const isPage = this.props.variant === "page";

    return (
      <div className={`error-boundary${isPage ? " error-boundary-page" : ""}`} role="alert">
        <div className="error-boundary-card">
          <span className="error-boundary-icon"><IconAlertTriangle /></span>
          <h2 className="error-boundary-title">Algo salió mal</h2>
          <p className="error-boundary-text">
            Ocurrió un error inesperado al mostrar esta pantalla. Puedes intentarlo de nuevo
            o volver al inicio. Si el problema continúa, avisa al administrador.
          </p>

          {import.meta.env.DEV && (
            <pre className="error-boundary-detail">{String(error?.message ?? error)}</pre>
          )}

          <div className="error-boundary-actions">
            <button type="button" className="btn btn-primary" onClick={this.handleRetry}>
              <IconRefresh />
              Reintentar
            </button>
            <a className="btn btn-secondary" href="/">
              <IconHome />
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
