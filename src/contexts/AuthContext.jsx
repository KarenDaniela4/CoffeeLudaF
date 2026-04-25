import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

/**
 * AuthContext — estado global de autenticación.
 * 
 * Reemplaza al uso de $_SESSION del proyecto PHP original.
 * 
 * Expone:
 *   usuario   — objeto con { id, email, id_rol, nombre, ... } o null
 *   cargando  — true mientras se valida el token al arrancar
 *   login     — función async (email, password) → hace POST /auth/login
 *   logout    — limpia token y estado
 *   esAdmin   — boolean helper
 * 
 * Se usa desde cualquier componente con:
 *   const { usuario, login, logout } = useAuth();
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar la app, intentamos recuperar la sesión desde localStorage.
  // Si hay un usuario guardado, confiamos en él (el token se revalida en cada request
  // vía el interceptor — si está expirado, el servidor devuelve 401 y limpiamos).
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem('usuario');
      }
    }
    setCargando(false);
  }, []);

  /**
   * Login: envía credenciales al backend, guarda el JWT y el usuario.
   * Lanza excepción si falla (el componente Login la atrapa y muestra el error).
   */
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // Esperamos que el backend devuelva: { token, usuario: { id, email, id_rol, ... } }
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  };

  /**
   * Logout: limpia todo. Simple y sin llamada al servidor (JWT es stateless).
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const valor = {
    usuario,
    cargando,
    login,
    logout,
    esAdmin: usuario?.id_rol === 1,
    estaLogueado: usuario !== null,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook de conveniencia. Cualquier componente hace:
//   const { usuario, login } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
