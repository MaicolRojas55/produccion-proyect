import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget =
    process.env.API_PROXY_TARGET ||
    fileEnv.API_PROXY_TARGET ||
    "http://127.0.0.1:8080";

  const apiProxy = {
    target: apiProxyTarget,
    changeOrigin: true,
  };

  return {
    server: {
      // "true" escucha en todas las interfaces (mejor que "::" con clientes IPv4 en Windows).
      host: true,
      port: 5173,
      strictPort: false,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": apiProxy,
      },
    },
    preview: {
      host: true,
      port: 5173,
      strictPort: false,
      proxy: {
        "/api": apiProxy,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
