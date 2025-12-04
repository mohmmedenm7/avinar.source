import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  host: true, // مهم إذا كنت تستخدم ngrok
  port: 8080,
  allowedHosts: [
    'myrtice-enterological-shantay.ngrok-free.dev'
  ],
  headers: {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  },
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
