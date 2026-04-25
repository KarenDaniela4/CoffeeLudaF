import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite
// Documentación: https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy opcional: redirige llamadas a /api hacia el backend PHP.
    // Con esto evitamos problemas de CORS en desarrollo Y el código React
    // puede usar rutas relativas como "/api/productos".
    //
    // Si prefieres llamar directo con URL absoluta (http://localhost/CoffeeLuda-React/backend/api),
    // comenta este bloque y define VITE_API_URL en el archivo .env
    proxy: {
      '/api': {
        target: 'http://localhost/CoffeeLuda-React/backend',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
