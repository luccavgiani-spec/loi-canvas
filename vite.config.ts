import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core into its own chunk (cacheable across deploys)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split heavy UI libs
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tooltip', '@radix-ui/react-accordion', '@radix-ui/react-select', '@radix-ui/react-popover'],
          // Split data layer
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
    // Target modern browsers for smaller output
    target: 'es2020',
  },
}));
