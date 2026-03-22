import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";

const isReplit = !!process.env.REPL_ID;
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  base: "/",
  plugins: [
    react(),
  
    ...(isReplit
      ? await Promise.all([
          import("@replit/vite-plugin-runtime-error-modal").then((m) => m.default()),
          import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({ root: path.resolve(import.meta.dirname, "..") })
          ),
          import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]).catch(() => [])
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true, deny: ["**/.*"] },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
