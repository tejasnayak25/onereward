import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "monday-charming-younger-august.trycloudflare.com",
      "localhost",
      ".trycloudflare.com"
    ],
    proxy: {
      // string shorthand: http://localhost:8080/foo -> http://localhost:3000/foo
      // '/foo': 'http://localhost:3000',
      // with options
      '/api': {
        target: 'https://onereward-node.vercel.app',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // if your backend doesn't expect /api prefix
      },
      '/by-restaurant': {
        target: 'https://onereward-node.vercel.app',
        changeOrigin: true,
      },
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

