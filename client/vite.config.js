import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the Vite server proxies /api/* to the Express API so the browser
// only ever talks to one origin (avoids CORS headaches locally). In
// production, build this app (`npm run build`) and either serve client/dist
// with any static host, or point the Express server at it (see server.js —
// it auto-serves client/dist if present).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
