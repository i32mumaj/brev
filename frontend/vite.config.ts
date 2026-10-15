import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In production FastAPI serves both the frontend and the API from the same origin;
    // in development the proxy mimics that. changeOrigin makes the backend build short_url
    // with its own host (:8000), which is the one that handles the redirect.
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
