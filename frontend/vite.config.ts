import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En producción FastAPI sirve el front y la API en el mismo origen; en desarrollo
    // lo imita el proxy. changeOrigin hace que el backend construya las short_url con
    // su propio host (:8000), que es quien atiende la redirección.
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
