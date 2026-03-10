import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          maxWidth: "600px",
          margin: "2rem auto",
        }}
        >
          <h2 style={{ color: "#b91c1c" }}>Error en la aplicación</h2>
          <pre style={{
            background: "#fef2f2",
            padding: "1rem",
            overflow: "auto",
            fontSize: "14px",
          }}
          >
            {this.state.error.message}
          </pre>
          <p>
            Ejecuta el frontend desde la carpeta <code>frontend</code> y abre{" "}
            <a href="http://localhost:8080">http://localhost:8080</a>
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: "0.5rem 1rem", marginTop: "0.5rem" }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
