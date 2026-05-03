import axios from 'axios';

/**
 * Cliente HTTP centralizado.
 * 
 * Todas las llamadas a la API pasan por esta instancia de axios.
 * Ventajas:
 *   - Una sola baseURL configurable
 *   - El interceptor adjunta el JWT automáticamente a cada request
 *   - Manejo centralizado de errores 401 (token expirado)
 * 
 * Uso en componentes/hooks:
 *   import api from '../api/client';
 *   const { data } = await api.get('/productos');
 *   await api.post('/productos', { Producto: 'Latte', Precio: 8000 });
 */

// En desarrollo, Vite proxea /api hacia el backend PHP (ver vite.config.js),
// así que con baseURL = '/api' funciona. En producción, apuntar al dominio real.
const api = axios.create({
  baseURL: '[https://coffeeludab.onrender.com/api/index.php?route=](https://coffeeludab.onrender.com/api/index.php?route=)',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: antes de cada llamada, si hay un JWT en localStorage,
// lo adjuntamos al header Authorization. Así los componentes NO tienen que
// preocuparse por la autenticación en cada request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: si el servidor responde 401 (token inválido o expirado),
// limpiamos el storage y redirigimos al login. Esto evita que la app quede
// en un estado raro con un usuario "fantasma".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // Evitar loop si ya estamos en /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
