import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<p style='padding:2rem;font-family:sans-serif'>Error: no se encontró el elemento #root. Revisa index.html.</p>";
} else {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    rootEl.innerHTML = `<div style="padding:2rem;font-family:sans-serif;max-width:600px">
      <h2>Error al cargar la aplicación</h2>
      <pre style="background:#f5f5f5;padding:1rem;overflow:auto">${msg}</pre>
      <p>Asegúrate de ejecutar el frontend con: <code>cd frontend && npm run dev</code> y abre <a href="http://localhost:8080">http://localhost:8080</a></p>
    </div>`;
    console.error(err);
  }
}
