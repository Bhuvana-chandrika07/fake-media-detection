export default defineConfig({
  base: basePath,
  plugins: [
    
    react(),
    tailwindcss(),
    
    // conditional cartographer...
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@workspace/api-client-react": path.resolve(
        __dirname,
        "./src/workspace/api-client-react"
      )
    },
  },
  esbuild: {
    loader: {
      '.js': 'js' // FIX: prevent PostCSS parsing JS files
    }
  },
  optimizeDeps: {
    include: ['deepfake-detector']
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});