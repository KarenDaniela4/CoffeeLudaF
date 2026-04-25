import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — guarda rutas que requieren autenticación o un rol específico.
 * 
 * Reemplaza las verificaciones `session_start(); if (!isset($_SESSION['idrol']))` 
 * que había en cada .php del original.
 * 
 * Uso:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/mis-compras" element={<MisCompras />} />
 *   </Route>
 * 
 * Para rutas solo-admin:
 *   <Route element={<ProtectedRoute rolRequerido={1} />}>
 *     <Route path="/admin/productos" element={<GestionProductos />} />
 *   </Route>
 * 
 * Si el usuario no cumple, se redirige a /login (no autenticado) o a /menu (sin rol).
 */
export default function ProtectedRoute({ rolRequerido = null }) {
  const { usuario, cargando } = useAuth();

  // Mientras se carga el estado inicial desde localStorage, no decidimos nada.
  // Evita un "flash" de redirección indebida.
  if (cargando) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido !== null && usuario.id_rol !== rolRequerido) {
    return <Navigate to="/menu" replace />;
  }

  // Outlet renderiza las rutas hijas
  return <Outlet />;
}
